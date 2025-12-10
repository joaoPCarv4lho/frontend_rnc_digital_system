import { motion } from "framer-motion";

export function FadeMessage({
    text,
    color = "text-gray-500"
}: {
    text: string;
    color?: string;
}) {
    return(
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-center text-base sm:text-lg ${color}`}>
            {text}
        </motion.p>
    )
}