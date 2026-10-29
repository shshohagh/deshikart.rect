import React from 'react';
import { ProductSpec } from '../types';

interface ProductSpecsProps {
  specs: ProductSpec[];
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ specs }) => {
  return (
    <section className="bg-white py-6 px-4 border-t border-stone-100">
      <div className="max-w-xl mx-auto">
        {/* Section Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 font-bengali">
          প্রোডাক্ট স্পেসিফিকেশন
        </h2>

        {/* Specifications Table */}
        <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-sm border-collapse">
            <tbody>
              {specs.map((spec, index) => {
                const isEven = index % 2 === 0;
                return (
                  <tr
                    key={index}
                    className={`border-b border-stone-200 last:border-b-0 ${
                      isEven ? 'bg-stone-50/70' : 'bg-white'
                    }`}
                  >
                    <td className="w-1/3 py-3 px-3.5 font-semibold text-stone-800 border-r border-stone-200 align-top">
                      {spec.label}
                    </td>
                    <td className="w-2/3 py-3 px-3.5 text-stone-600 leading-relaxed align-top">
                      {spec.value}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
