
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import axios from 'axios';
import { writeFileSync } from 'fs';
import { defaultGifts } from '../src/lib/default-gifts';

// TODO: Adicione as suas credenciais do Firebase Admin SDK. Cole o conteúdo do ficheiro JSON que você baixa do Firebase Console.
// Exemplo: const serviceAccount = { "type": "service_account", ... };
const serviceAccount = require('./serviceAccountKey.json'); 

// TODO: Substitua pelo seu bucket ID. Você pode encontrá-lo no Firebase Console em Storage.
// Exemplo: 'meu-projeto-123.appspot.com'
const bucketId = 'YOUR_BUCKET_ID.appspot.com'; 

if (bucketId.includes('YOUR_BUCKET_ID')) {
  console.error("ERRO: Por favor, configure o bucketId em scripts/migrate-images.ts");
  process.exit(1);
}

try {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: bucketId
  });
} catch (e) {
    // Evita o erro "app already exists" se o script for executado várias vezes
}

const bucket = getStorage().bucket();

const migrateImages = async () => {
  const updatedGifts = [];
  const placeholderImage = 'https://picsum.photos/seed/placeholder/400/250';

  console.log(`Iniciando migração de ${defaultGifts.length} imagens...`);

  for (const gift of defaultGifts) {
    try {
      // Tenta baixar a imagem original
      const response = await axios.get(gift.imageUrl, { 
        responseType: 'arraybuffer',
        // Adiciona um user-agent para evitar bloqueios de hotlinking
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000 // Timeout de 5 segundos
      });
      
      const imageBuffer = Buffer.from(response.data);
      const contentType = response.headers['content-type'];
      
      // Validação simples do tipo de conteúdo
      if (!contentType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(contentType)) {
          throw new Error(`Tipo de conteúdo inválido: ${contentType}`);
      }

      const fileName = `site_images/gifts/${gift.id}.${contentType.split('/')[1]}`;
      const file = bucket.file(fileName);

      await file.save(imageBuffer, {
        metadata: { contentType },
        public: true, // Torna o ficheiro publicamente legível
      });

      // O URL público para um objeto no Firebase Storage
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      updatedGifts.push({
        ...gift,
        imageUrl: publicUrl,
      });

      console.log(`✅ Migrado com sucesso: ${gift.title}`);

    } catch (error: any) {
      console.error(`❌ Falha ao migrar "${gift.title}": ${error.message}. Usando placeholder.`);
      // Se falhar, usa uma imagem placeholder para evitar links quebrados
      updatedGifts.push({
        ...gift,
        imageUrl: placeholderImage,
      });
    }
  }

  // Gera o novo conteúdo para o ficheiro default-gifts.ts
  const updatedFileContent = `
import type { Product } from '@/types/siteConfig';

// Este ficheiro foi gerado automaticamente por scripts/migrate-images.ts
// Não edite manualmente.

export const defaultGifts: Product[] = ${JSON.stringify(updatedGifts, null, 2)};
  `;

  // Escreve o novo ficheiro
  writeFileSync('./src/lib/default-gifts-migrated.ts', updatedFileContent.trim());

  console.log('\n🎉 Migração completa! 🎉');
  console.log('Um novo ficheiro foi criado: src/lib/default-gifts-migrated.ts');
  console.log('Por favor, renomeie este ficheiro para "default-gifts.ts" para aplicar as alterações.');
};

migrateImages();
