import React, { useState } from 'react';
import { FormattedNumberInput, formatCurrency } from './CalculatorsSection';

const TaxSavingCalculator = () => {
  const [step, setStep] = useState(1);
  
  // Step 1: Income
  const [salary, setSalary] = useState(1200000);
  const [otherIncome, setOtherIncome] = useState(0);
  
  // Step 2: Deductions
  const [sec80C, setSec80C] = useState(0);
  const [sec80CCD, setSec80CCD] = useState(0);
  const [sec80D, setSec80D] = useState(0);
  
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [hra, setHra] = useState(0);
  const [homeLoanInterest, setHomeLoanInterest] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);

  const grossIncome = salary + otherIncome;
  
  // New Regime
  const standardDeductionNew = 75000;
  const taxableNew = Math.max(0, grossIncome - standardDeductionNew);
  let taxNew = 0;
  if (taxableNew > 2400000) taxNew = (taxableNew - 2400000) * 0.3 + 300000;
  else if (taxableNew > 2000000) taxNew = (taxableNew - 2000000) * 0.25 + 200000;
  else if (taxableNew > 1600000) taxNew = (taxableNew - 1600000) * 0.2 + 120000;
  else if (taxableNew > 1200000) taxNew = (taxableNew - 1200000) * 0.15 + 60000;
  else if (taxableNew > 800000) taxNew = (taxableNew - 800000) * 0.1 + 20000;
  else if (taxableNew > 400000) taxNew = (taxableNew - 400000) * 0.05;
  
  if (taxableNew <= 1200000) taxNew = 0; // Rebate 87A

  const totalTaxNew = taxNew + (taxNew * 0.04);

  // Old Regime
  const standardDeductionOld = 50000;
  const applied80C = Math.min(sec80C, 150000);
  const applied80CCD = Math.min(sec80CCD, 50000);
  const totalDeductionsOld = applied80C + applied80CCD + sec80D + hra + homeLoanInterest + otherDeductions;
  const taxableOld = Math.max(0, grossIncome - standardDeductionOld - totalDeductionsOld);
  
  let taxOld = 0;
  if (taxableOld > 1000000) taxOld = (taxableOld - 1000000) * 0.3 + 112500;
  else if (taxableOld > 500000) taxOld = (taxableOld - 500000) * 0.2 + 12500;
  else if (taxableOld > 250000) taxOld = (taxableOld - 250000) * 0.05;

  if (taxableOld <= 500000) taxOld = 0; // Rebate 87A

  const totalTaxOld = taxOld + (taxOld * 0.04);

  const recommendedRegime = totalTaxNew <= totalTaxOld ? 'New Regime' : 'Old Regime';
  const taxSaved = Math.abs(totalTaxOld - totalTaxNew);

  const unused80C = Math.max(0, 150000 - sec80C);
  const unusedNPS = Math.max(0, 50000 - sec80CCD);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-brand-light/20">
        <div>
          <h3 className="text-2xl font-serif text-gray-900">Tax Saving Calculator</h3>
          <p className="text-sm text-gray-500 mt-1">Compare Old vs New Regime & find saving opportunities</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s ? 'bg-brand-blue text-white' : step > s ? 'bg-brand-gold text-white' : 'bg-gray-100 text-gray-400'}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Step 1: Income Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary Income</label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue focus-within:border-brand-blue transition-all mb-3">
                  <span className="text-gray-500 mr-2">₹</span>
                  <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={salary} onChange={setSalary} />
                </div>
                <input type="range" min="0" max="5000000" step="50000" value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Income (Optional)</label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue focus-within:border-brand-blue transition-all mb-3">
                  <span className="text-gray-500 mr-2">₹</span>
                  <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={otherIncome} onChange={setOtherIncome} />
                </div>
                <input type="range" min="0" max="2000000" step="10000" value={otherIncome} onChange={(e) => setOtherIncome(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
              <div className="text-brand-blue mt-0.5">ℹ️</div>
              <p className="text-sm text-blue-800">Standard deduction of ₹75,000 (New Regime) or ₹50,000 (Old Regime) will be automatically applied to your salary income.</p>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={() => setStep(2)} className="bg-brand-blue hover:bg-[#152a45] text-white px-6 py-2.5 rounded-md font-medium transition-colors">
                Next: Deductions
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Step 2: Deductions & Tax Inputs</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Section 80C <span title="EPF, PPF, ELSS, LIC, etc. Max ₹1.5L" className="cursor-help text-gray-400 text-xs border rounded-full w-4 h-4 flex items-center justify-center">?</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue mb-3">
                  <span className="text-gray-500 mr-2">₹</span>
                  <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={sec80C} onChange={setSec80C} />
                </div>
                <input type="range" min="0" max="150000" step="5000" value={sec80C} onChange={(e) => setSec80C(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue" />
                <p className="text-xs text-gray-500 mt-2">Max limit: ₹1,50,000</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Section 80CCD(1B) - NPS <span title="Additional deduction for NPS. Max ₹50K" className="cursor-help text-gray-400 text-xs border rounded-full w-4 h-4 flex items-center justify-center">?</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue mb-3">
                  <span className="text-gray-500 mr-2">₹</span>
                  <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={sec80CCD} onChange={setSec80CCD} />
                </div>
                <input type="range" min="0" max="50000" step="5000" value={sec80CCD} onChange={(e) => setSec80CCD(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue" />
                <p className="text-xs text-gray-500 mt-2">Max limit: ₹50,000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Section 80D - Health Insurance <span title="Medical insurance premiums" className="cursor-help text-gray-400 text-xs border rounded-full w-4 h-4 flex items-center justify-center">?</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue mb-3">
                  <span className="text-gray-500 mr-2">₹</span>
                  <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={sec80D} onChange={setSec80D} />
                </div>
                <input type="range" min="0" max="100000" step="5000" value={sec80D} onChange={(e) => setSec80D(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue" />
                <p className="text-xs text-gray-500 mt-2">Self/Family + Parents</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-md overflow-hidden">
              <button 
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Advanced Deductions (HRA, Home Loan, etc.)
                <span>{advancedOpen ? '▲' : '▼'}</span>
              </button>
              
              {advancedOpen && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HRA Exemption</label>
                    <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue">
                      <span className="text-gray-500 mr-2">₹</span>
                      <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={hra} onChange={setHra} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Home Loan Interest (Sec 24b)</label>
                    <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue">
                      <span className="text-gray-500 mr-2">₹</span>
                      <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={homeLoanInterest} onChange={setHomeLoanInterest} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Deductions</label>
                    <div className="flex items-center border border-gray-200 rounded-md px-3 py-2 bg-gray-50 focus-within:ring-1 focus-within:ring-brand-blue">
                      <span className="text-gray-500 mr-2">₹</span>
                      <FormattedNumberInput className="w-full bg-transparent focus:outline-none text-gray-900 font-medium" value={otherDeductions} onChange={setOtherDeductions} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 px-4 py-2 font-medium">
                Back
              </button>
              <button onClick={() => setStep(3)} className="bg-brand-blue hover:bg-[#152a45] text-white px-6 py-2.5 rounded-md font-medium transition-colors">
                Calculate Tax
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">Recommended: <span className="text-brand-gold">{recommendedRegime}</span></h4>
              <p className="text-gray-600">You save <span className="font-bold text-green-600">{formatCurrency(taxSaved)}</span> by choosing the {recommendedRegime}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl border-2 ${recommendedRegime === 'Old Regime' ? 'border-brand-gold bg-yellow-50/30' : 'border-gray-200 bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-gray-900">Old Regime</h5>
                  {recommendedRegime === 'Old Regime' && <span className="bg-brand-gold text-white text-xs px-2 py-1 rounded-full font-medium">Best Choice</span>}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gross Income</span>
                    <span className="font-medium">{formatCurrency(grossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Deductions</span>
                    <span className="font-medium text-green-600">-{formatCurrency(standardDeductionOld + totalDeductionsOld)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Taxable Income</span>
                    <span className="font-medium">{formatCurrency(taxableOld)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                    <span className="text-gray-900">Total Tax</span>
                    <span className="text-brand-blue">{formatCurrency(totalTaxOld)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">Benefit: Maximizes tax savings through investments and deductions.</p>
              </div>

              <div className={`p-6 rounded-xl border-2 ${recommendedRegime === 'New Regime' ? 'border-brand-gold bg-yellow-50/30' : 'border-gray-200 bg-white'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-lg font-semibold text-gray-900">New Regime</h5>
                  {recommendedRegime === 'New Regime' && <span className="bg-brand-gold text-white text-xs px-2 py-1 rounded-full font-medium">Best Choice</span>}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gross Income</span>
                    <span className="font-medium">{formatCurrency(grossIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Standard Deduction</span>
                    <span className="font-medium text-green-600">-{formatCurrency(standardDeductionNew)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Taxable Income</span>
                    <span className="font-medium">{formatCurrency(taxableNew)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3 mt-2">
                    <span className="text-gray-900">Total Tax</span>
                    <span className="text-brand-blue">{formatCurrency(totalTaxNew)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">Benefit: Lower tax rates and simpler filing process.</p>
              </div>
            </div>

            <div className="bg-brand-light/30 rounded-xl p-6 border border-brand-blue/10">
              <h5 className="text-lg font-semibold text-brand-blue mb-4 flex items-center gap-2">
                💡 Smart Recommendations
              </h5>
              <ul className="space-y-3">
                {unused80C > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700">You can still invest <span className="font-semibold">{formatCurrency(unused80C)}</span> under Section 80C to save more tax under the Old Regime.</p>
                  </li>
                )}
                {unusedNPS > 0 && (
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700">You may be eligible to save more by contributing <span className="font-semibold">{formatCurrency(unusedNPS)}</span> to NPS under Section 80CCD(1B).</p>
                  </li>
                )}
                {sec80D === 0 && (
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <p className="text-sm text-gray-700">Consider reviewing health insurance for yourself and your parents to claim benefits under Section 80D.</p>
                  </li>
                )}
                {recommendedRegime === 'Old Regime' && (
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold mt-0.5">★</span>
                    <p className="text-sm text-gray-700">The Old Regime is better for you because your deductions outweigh the lower tax slabs of the New Regime.</p>
                  </li>
                )}
                {recommendedRegime === 'New Regime' && (
                  <li className="flex items-start gap-3">
                    <span className="text-brand-gold mt-0.5">★</span>
                    <p className="text-sm text-gray-700">The New Regime is better for you. It offers lower tax rates and a simpler filing process without needing to track investments.</p>
                  </li>
                )}
              </ul>
            </div>

            <div className="text-center space-y-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 italic">Disclaimer: This is an estimate based on FY 2025-26 / AY 2026-27 rules and not tax filing or legal advice.</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={() => { setStep(1); setSalary(1200000); setOtherIncome(0); setSec80C(0); setSec80CCD(0); setSec80D(0); setHra(0); setHomeLoanInterest(0); setOtherDeductions(0); }} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
                  Recalculate
                </button>
                <button className="bg-brand-gold hover:bg-[#b08d4a] text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm">
                  Book a Tax Planning Call
                </button>
              </div>
              <p className="text-sm font-medium text-brand-blue pt-2">Talk to Solitaire Financial Solutions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxSavingCalculator;
