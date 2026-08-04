import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 bg-[#3D348B] text-white px-5 py-2.5 rounded-2xl text-xs font-bold border-2 border-white shadow-xl z-50 flex items-center space-x-2"
        >
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
