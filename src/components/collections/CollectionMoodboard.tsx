import { motion } from "motion/react";
import { PremiumGlass } from "@/components/ui/PremiumGlass";
import { ImageIcon } from "lucide-react";

interface Props {
  collection?: {
    images?: string[];
  };
}

export function CollectionMoodboard({ collection }: Props) {
  // Mock image array for the masonry
  const images = collection?.images ?? [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534294228306-bd54eb9a7ba8?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?q=80&w=2000&auto=format&fit=crop"
  ];

  return (
    <PremiumGlass className="overflow-hidden p-6 relative min-h-[300px]">
      <div className="flex items-center gap-2 mb-6">
        <ImageIcon size={18} className="text-muted-foreground" />
        <h4 className="font-display text-lg tracking-tight">Moodboard</h4>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img: string, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`relative overflow-hidden rounded-xl ${
              i === 0 ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
            <img 
              src={img} 
              alt="Moodboard visual" 
              className="aspect-square w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
          </motion.div>
        ))}
      </div>
    </PremiumGlass>
  );
}
