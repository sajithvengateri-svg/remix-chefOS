import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import chefOSLogo from "@/assets/chefos-logo.png";

const PortalSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo */}
          <motion.img
            src={chefOSLogo}
            alt="ChefOS"
            className="w-32 h-32 mx-auto mb-8 rounded-3xl shadow-2xl"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          />

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome to <span className="text-primary">ChefOS</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-12">
            The complete kitchen operating system for professional chefs.
            Manage recipes, inventory, prep lists, and more.
          </p>

          {/* Single CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={() => navigate("/auth")}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <ChefHat className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="text-lg">Enter Kitchen</span>
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            Sign in or create your account to get started
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default PortalSelect;