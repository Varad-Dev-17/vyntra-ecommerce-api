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
    <section className="py-8 md:py-12 bg-[#FAFBFF]">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <FadeIn>
          <motion.div
            className="p-6 md:p-10 relative overflow-hidden flex flex-col items-center text-center rounded-2xl bg-[#FCF8FF]"
            style={{
              border: "1px dashed #d1c8f0",
            }}
            whileHover={{
              borderColor: "#a78bfa"
            }}
          >
            <motion.h2
              className="text-2xl md:text-4xl font-black text-[#111827] mb-2 uppercase tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Unlock 15% Off
            </motion.h2>

            <motion.p
              className="text-sm md:text-base text-[#535766] max-w-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Sign up for our newsletter and enjoy 15% off your first order.
            </motion.p>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 w-full max-w-lg"
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
                className="grow bg-white border border-[#d1c8f0] rounded-xl px-5 py-3 focus:ring-2 focus:ring-[#4648D4] outline-none text-[#111827] placeholder-[#767586] text-sm font-medium shadow-sm"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                type="submit"
                className="px-6 py-3 text-white font-bold rounded-xl text-sm shadow-[0_10px_30px_rgba(70,72,212,0.2)] shrink-0"
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
