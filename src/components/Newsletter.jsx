import { useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "../animations/FadeIn";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <section className="py-16 bg-[#FCF8FF]">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <FadeIn>
          <motion.div
            className="p-12 md:p-16 rounded-3xl relative overflow-hidden flex flex-col items-center text-center"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
            }}
            whileHover={{
              boxShadow: "0 20px 60px rgba(70, 72, 212, 0.1)",
            }}
          >
            <motion.h2
              className="text-3xl font-bold text-[#4648D4] mb-4 font-['Manrope']"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Join the Inner Circle
            </motion.h2>

            <motion.p
              className="text-lg text-[#464554] max-w-lg mb-8 font-['Be_Vietnam_Pro']"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Receive early access to seasonal drops and curated aesthetic
              inspiration directly to your inbox.
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                className="grow bg-white/60 border border-[#C7C4D7]/40 rounded-xl px-6 py-4 focus:ring-2 focus:ring-[#4648D4] outline-none text-[#1B1B23] placeholder-[#767586]"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                className="px-8 py-4 text-white font-semibold rounded-xl font-['Be_Vietnam_Pro']"
                style={{
                  background:
                    "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(70, 72, 212, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitted ? "Subscribed!" : "Subscribe"}
              </motion.button>
            </motion.form>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Newsletter;
