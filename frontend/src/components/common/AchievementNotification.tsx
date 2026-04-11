import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { achievements as allAchievements } from '../../services/achievements';

export const AchievementNotification: React.FC = () => {
  const newlyUnlocked = useAppStore((state) => state.newlyUnlockedAchievements);
  const [visible, setVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setQueue(prev => [...prev, ...newlyUnlocked]);
    }
  }, [newlyUnlocked]);

  useEffect(() => {
    if (queue.length > 0 && !currentAchievement) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrentAchievement(next);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrentAchievement(null);
        }, 500);
      }, 3000);
    }
  }, [queue, currentAchievement]);

  if (!currentAchievement) return null;

  const achievement = allAchievements.find((a) => a.id === currentAchievement);
  if (!achievement) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3 max-w-sm border-2 border-yellow-300">
        <span className="text-4xl">{achievement.icon}</span>
        <div>
          <p className="font-bold text-sm">🏆 Новое достижение!</p>
          <p className="font-semibold">{achievement.title}</p>
          <p className="text-xs opacity-90">{achievement.description}</p>
        </div>
      </div>
    </div>
  );
};
