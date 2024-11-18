"use client";

import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{
            rotate: 360,
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="inline-block"
        >
          <BookOpen className="w-12 h-12 text-white" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white"
        >
          StudySync
        </motion.h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="h-1 bg-white/30 rounded-full mx-auto overflow-hidden"
        >
          <motion.div
            animate={{
              x: [-200, 200],
              transition: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }
            }}
            className="h-full w-1/2 bg-white rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}