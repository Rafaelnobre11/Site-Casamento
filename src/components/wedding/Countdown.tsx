
'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const countdownItems = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Minutos' },
    { value: timeLeft.seconds, label: 'Segundos' },
  ];

  return (
    <div className="flex justify-center items-center gap-4 md:gap-8">
      {countdownItems.map((item, index) => (
        <div key={item.label} className="flex items-center">
          <div className="text-center">
            <div className="font-headline text-4xl md:text-6xl text-white">
              {formatNumber(item.value)}
            </div>
            <div className="text-xs md:text-sm uppercase tracking-widest text-white/80">
              {item.label}
            </div>
          </div>
          {index < countdownItems.length - 1 && (
            <span className="font-headline text-4xl md:text-6xl text-white/50 mx-2 md:mx-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Countdown;
