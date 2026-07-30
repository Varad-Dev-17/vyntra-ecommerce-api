import { useState } from "react";
import { motion } from "framer-motion";
import FadeIn from "../../animations/FadeIn";

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
    <section className="py-16 bg-[#FFFFFF]">
      <div className="max-w-5xl mx-auto px-4 md:px-12">
        <FadeIn>
          <motion.div
            className="p-8 sm:p-12 md:p-16 relative overflow-hidden flex flex-col items-center text-center rounded-[32px] bg-[#FCF8FF]"
            style={{
              border: "2px dashed #d1c8f0",
            }}
            whileHover={{
              borderColor: "#a78bfa"
            }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-black text-[#111827] mb-4 uppercase tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Unlock 15% Off
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-[#535766] max-w-2xl mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Sign up for our newsletter and enjoy 15% off your first order.
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="grow bg-white border border-[#d1c8f0] rounded-2xl px-8 py-5 focus:ring-2 focus:ring-[#4648D4] outline-none text-[#111827] placeholder-[#767586] text-lg font-medium shadow-sm"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                className="px-10 py-5 text-white font-bold rounded-2xl text-lg shadow-[0_10px_30px_rgba(70,72,212,0.2)]"
                style={{
                  background: "linear-gradient(135deg, #4648d4 0%, #6b38d4 100%)",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 15px 40px rgba(70,72,212,0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitted ? "Signed up!" : "Sign up"}
              </motion.button>
            </motion.form>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Newsletter;
