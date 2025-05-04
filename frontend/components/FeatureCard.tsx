import { motion } from 'framer-motion';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay: number;
    isVisible: boolean;
}
  
const FeatureCard = ({ icon, title, description, delay, isVisible }: FeatureCardProps) => {
return (
    <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
    transition={{ duration: 0.5, delay }}
    className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300"
    >
    <div className="bg-gray-800 rounded-full w-14 h-14 flex items-center justify-center mb-4">
        {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
    </motion.div>
);
};

export default FeatureCard;