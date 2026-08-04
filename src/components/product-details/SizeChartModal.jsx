import React from "react";
import { X, Ruler } from "lucide-react";

const SizeChartModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Exact measurements matching reference image
  const chartData = [
    { size: "S", in: "30.0", cm: "76.0" },
    { size: "M", in: "34.0", cm: "86.0" },
    { size: "L", in: "38.0", cm: "96.0" },
    { size: "XL", in: "42.0", cm: "106.0" },
    { size: "XXL", in: "44.0", cm: "112.0" },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:px-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 shadow-xs">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] sm:text-xl font-bold text-[#282c3f]">Size Chart & Measurements</h2>
              <p className="text-[12px] sm:text-[13px] text-[#7e818c]">Check body dimensions below to find your perfect fit.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-8 flex-1">
          {/* Table Section */}
          <div className="space-y-2.5">
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-center border-collapse">
                <thead>
                  {/* Top Header Row */}
                  <tr className="bg-white text-[13px] font-extrabold text-[#282c3f] border-b border-gray-200">
                    <th rowSpan={2} className="py-3.5 px-6 border-r border-gray-200 w-1/3 text-center align-middle">
                      Size
                    </th>
                    <th colSpan={2} className="py-3 px-4 text-center tracking-wide">
                      To Fit Waist *
                    </th>
                  </tr>
                  {/* Sub Header Row for in & cm */}
                  <tr className="bg-gray-50 text-[12px] font-bold text-[#7e818c] border-b border-gray-200">
                    <th className="py-2.5 px-4 w-1/3 text-center border-r border-gray-200/60 font-medium">in</th>
                    <th className="py-2.5 px-4 w-1/3 text-center font-medium">cm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[14px] text-[#282c3f]">
                  {chartData.map((row) => (
                    <tr
                      key={row.size}
                      className="hover:bg-gray-50/80 text-[#282c3f] transition-colors"
                    >
                      <td className="py-3.5 px-6 border-r border-gray-200 text-center font-bold text-[15px] text-[#282c3f]">
                        {row.size}
                      </td>
                      <td className="py-3.5 px-4 border-r border-gray-200/60 font-mono text-[#282c3f]">
                        {row.in}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#282c3f]">
                        {row.cm}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <p className="text-[12px] text-[#7e818c] font-medium pl-1">
              * To-Fit Denotes Body Measurements
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* How to measure yourself section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[17px] font-extrabold text-[#282c3f]">How to measure yourself</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column: Technical Vector Illustration with ALL 6 measurement points (md:col-span-4) */}
              <div className="md:col-span-4 bg-[#F8FAFC] border border-gray-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-center shadow-2xs">
                <div className="w-full max-w-[270px] flex items-center justify-center">
                  {/* High-precision vector illustration mapping points 1 to 6 */}
                  <svg viewBox="0 0 320 315" className="w-full h-auto drop-shadow-2xs">
                    {/* --- TROUSERS BASE OUTLINE --- */}
                    <path
                      d="M 95,55 L 205,55 C 215,85 220,115 225,270 L 175,270 L 150,165 L 125,270 L 75,270 C 80,115 85,85 95,55 Z"
                      fill="white"
                      stroke="#475569"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    
                    {/* Waistband Bottom Seam */}
                    <line x1="93" y1="73" x2="207" y2="73" stroke="#475569" strokeWidth="2.5" />
                    
                    {/* Center Button Box & Button */}
                    <rect x="143" y="55" width="14" height="18" fill="white" stroke="#475569" strokeWidth="2" />
                    <circle cx="150" cy="64" r="2.5" fill="#475569" />

                    {/* Belt Loops */}
                    <rect x="98" y="55" width="6" height="18" fill="white" stroke="#475569" strokeWidth="2" />
                    <rect x="120" y="55" width="6" height="18" fill="white" stroke="#475569" strokeWidth="2" />
                    <rect x="174" y="55" width="6" height="18" fill="white" stroke="#475569" strokeWidth="2" />
                    <rect x="196" y="55" width="6" height="18" fill="white" stroke="#475569" strokeWidth="2" />

                    {/* Left & Right Front Curved Pockets */}
                    <path d="M 93,73 C 105,77 108,90 88,110" fill="none" stroke="#475569" strokeWidth="2" />
                    <path d="M 207,73 C 195,77 192,90 212,110" fill="none" stroke="#475569" strokeWidth="2" />

                    {/* Fly Zipper Stitching */}
                    <path d="M 150,73 L 150,145 C 145,155 140,160 150,165" fill="none" stroke="#475569" strokeWidth="2" />
                    <path d="M 157,73 L 157,143 C 155,153 145,160 150,165" fill="none" stroke="#475569" strokeDasharray="4,3" strokeWidth="1.5" />

                    {/* ================= MEASUREMENT GUIDE BADGES 1-6 ================= */}

                    {/* --- POINT 1: WAIST OVAL --- */}
                    <ellipse cx="150" cy="30" rx="55" ry="9" fill="none" stroke="#4F46E5" strokeDasharray="5,3" strokeWidth="2.5" />
                    <line x1="62" y1="30" x2="90" y2="30" stroke="#4F46E5" strokeDasharray="3,3" strokeWidth="2" />
                    <polygon points="93,30 86,26 86,34" fill="#4F46E5" />
                    <circle cx="48" cy="30" r="13" fill="#4F46E5" />
                    <text x="48" y="35" fill="white" fontSize="14" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle">1</text>

                    {/* --- POINT 2: RISE LINE --- */}
                    <line x1="150" y1="55" x2="150" y2="165" stroke="#4F46E5" strokeDasharray="5,3" strokeWidth="2.5" />
                    <circle cx="150" cy="120" r="13" fill="#4F46E5" />
                    <text x="150" y="125" fill="white" fontSize="14" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle">2</text>

                    {/* --- POINT 3: THIGH WIDTH --- */}
                    <line x1="79" y1="180" x2="145" y2="180" stroke="#4F46E5" strokeDasharray="4,3" strokeWidth="2.5" />
                    <line x1="61" y1="180" x2="79" y2="180" stroke="#4F46E5" strokeDasharray="3,3" strokeWidth="2" />
                    <polygon points="81,180 75,176 75,184" fill="#4F46E5" />
                    <circle cx="48" cy="180" r="13" fill="#4F46E5" />
                    <text x="48" y="185" fill="white" fontSize="14" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle">3</text>

                    {/* --- POINT 4: OUTSEAM LENGTH (Right outer boundary) --- */}
                    <line x1="205" y1="55" x2="265" y2="55" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1.5" />
                    <line x1="225" y1="270" x2="265" y2="270" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1.5" />
                    <line x1="260" y1="55" x2="260" y2="270" stroke="#4F46E5" strokeDasharray="5,3" strokeWidth="2.5" />
                    <line x1="254" y1="55" x2="266" y2="55" stroke="#4F46E5" strokeWidth="2.5" />
                    <line x1="254" y1="270" x2="266" y2="270" stroke="#4F46E5" strokeWidth="2.5" />
                    <circle cx="260" cy="162" r="13" fill="#4F46E5" />
                    <text x="260" y="167" fill="white" fontSize="14" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle">4</text>

                    {/* --- POINT 5: BOTTOM HEM (Left leg opening) --- */}
                    <line x1="75" y1="270" x2="75" y2="288" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1.5" />
                    <line x1="125" y1="270" x2="125" y2="288" stroke="#94a3b8" strokeDasharray="2,2" strokeWidth="1.5" />
                    <line x1="75" y1="284" x2="125" y2="284" stroke="#4F46E5" strokeDasharray="4,3" strokeWidth="2.5" />
                    <circle cx="100" cy="294" r="13" fill="#4F46E5" />
                    <text x="100" y="299" fill="white" fontSize="14" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle">5</text>

                    {/* --- POINT 6: INSEAM LENGTH (Right leg internal seam) --- */}
                    <line x1="150" y1="165" x2="175" y2="270" stroke="#4F46E5" strokeDasharray="4,3" strokeWidth="2.5" />
                    <circle cx="173" cy="215" r="13" fill="#4F46E5" />
                    <text x="173" y="220" fill="white" fontSize="14" fontWeight="extrabold" fontFamily="sans-serif" textAnchor="middle">6</text>
                  </svg>
                </div>
              </div>

              {/* Middle Column: Fields 1 & 2 (md:col-span-4) */}
              <div className="md:col-span-4 space-y-6">
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">1</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#282c3f]">To Fit Waist</h4>
                    <p className="text-[13px] text-[#7e818c] mt-1 leading-relaxed">
                      Measure around the narrowest part of your waist.
                    </p>
                  </div>
                </div>

                <div className="border-b border-gray-100 my-2 md:hidden" />

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">2</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#282c3f]">Rise (From Top)</h4>
                    <p className="text-[13px] text-[#7e818c] mt-1 leading-relaxed">
                      Measure from the top of the waistband to the crotch seam.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Fields 3, 4, 5 & 6 (md:col-span-4) */}
              <div className="md:col-span-4 space-y-6">
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">3</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#282c3f]">Thigh</h4>
                    <p className="text-[13px] text-[#7e818c] mt-1 leading-relaxed">
                      Measure around the fullest part of your thigh.
                    </p>
                  </div>
                </div>

                <div className="border-b border-gray-100 my-2 md:hidden" />

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">4</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#282c3f]">Outseam Length</h4>
                    <p className="text-[13px] text-[#7e818c] mt-1 leading-relaxed">
                      Measure from the top of the waistband to the bottom hem.
                    </p>
                  </div>
                </div>

                <div className="border-b border-gray-100 my-2 md:hidden" />

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">5</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#282c3f]">Bottom Hem</h4>
                    <p className="text-[13px] text-[#7e818c] mt-1 leading-relaxed">
                      Measure around the bottom opening of the leg.
                    </p>
                  </div>
                </div>

                <div className="border-b border-gray-100 my-2 md:hidden" />

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">6</div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#282c3f]">Inseam Length</h4>
                    <p className="text-[13px] text-[#7e818c] mt-1 leading-relaxed">
                      Measure from the crotch seam to the bottom hem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-8 border-t border-gray-100 bg-gray-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338ca] text-white font-bold text-[13px] transition-colors shadow-sm cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
