import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const color = payload[0].payload?.fill || payload[0].color || '#1e3a5f';
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="text-sm font-medium text-gray-900 mb-1">{payload[0].name}</p>
        <p className="text-sm font-bold" style={{ color }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export const FormattedNumberInput = ({ value, onChange, min, max, className }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value.toLocaleString('en-IN'));

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toLocaleString('en-IN'));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[\d,]*\.?\d*$/.test(val)) {
      setLocalValue(val);
      const parsed = Number(val.replace(/,/g, ''));
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    let parsed = Number(localValue.replace(/,/g, ''));
    if (isNaN(parsed)) parsed = min || 0;
    if (min !== undefined && parsed < min) parsed = min;
    if (max !== undefined && parsed > max) parsed = max;
    onChange(parsed);
    setLocalValue(parsed.toLocaleString('en-IN'));
  };

  return (
    <input
      type="text"
      className={className}
      value={isFocused ? localValue : value.toLocaleString('en-IN')}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
    />
  );
};

const SIPCalculator = ({ openModal }: { openModal: () => void }) => {
  const [type, setType] = useState<'sip' | 'lumpsum'>('sip');
  const [investment, setInvestment] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const investedAmount = type === 'sip' ? investment * 12 * years : investment;
  const estReturns = investedAmount * (rate / 100) * (years / 2); // Very rough approximation for visual
  const totalValue = investedAmount + estReturns;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      <h3 className="text-2xl font-serif text-gray-900 mb-8">SIP Calculator</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex bg-brand-light/50 rounded-full p-1 w-max mb-6">
            <button 
              onClick={() => setType('sip')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${type === 'sip' ? 'bg-brand-light text-brand-blue' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              SIP
            </button>
            <button 
              onClick={() => setType('lumpsum')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${type === 'lumpsum' ? 'bg-brand-light text-brand-blue' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Lumpsum
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">{type === 'sip' ? 'Monthly investment' : 'Total investment'}</label>
              <div className="flex items-center bg-brand-light/50 text-brand-blue rounded px-3 py-1">
                <span className="mr-1">₹</span>
                <FormattedNumberInput 
                  className="w-24 text-right bg-transparent focus:outline-none font-semibold"
                  value={investment || 0}
                  onChange={setInvestment}
                  min={type === 'sip' ? 500 : 10000}
                  max={type === 'sip' ? 1000000 : 10000000}
                />
              </div>
            </div>
            <input 
              type="range" 
              className="w-full accent-brand-blue" 
              value={investment} 
              onChange={(e) => setInvestment(Number(e.target.value))}
              min={type === 'sip' ? 500 : 10000} 
              max={type === 'sip' ? 1000000 : 10000000} 
              step={type === 'sip' ? 500 : 10000}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Expected return rate (p.a)</label>
              <div className="flex items-center bg-brand-light/50 text-brand-blue rounded px-3 py-1">
                <FormattedNumberInput 
                  className="w-16 text-right bg-transparent focus:outline-none font-semibold"
                  value={rate || 0}
                  onChange={setRate}
                  min={1}
                  max={20}
                />
                <span className="ml-1">%</span>
              </div>
            </div>
            <input 
              type="range" 
              className="w-full accent-brand-blue" 
              value={rate} 
              onChange={(e) => setRate(Number(e.target.value))}
              min="1" max="20" step="0.1"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Time period</label>
              <div className="flex items-center bg-brand-light/50 text-brand-blue rounded px-3 py-1">
                <FormattedNumberInput 
                  className="w-16 text-right bg-transparent focus:outline-none font-semibold"
                  value={years || 0}
                  onChange={setYears}
                  min={1}
                  max={40}
                />
                <span className="ml-1 text-sm">Yr</span>
              </div>
            </div>
            <input 
              type="range" 
              className="w-full accent-brand-blue" 
              value={years} 
              onChange={(e) => setYears(Number(e.target.value))}
              min="1" max="40" step="1"
            />
          </div>

          <div className="pt-6 space-y-4">
            {/* Removed inline details list as it will be moved below the graph */}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-64 h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Invested amount', value: investedAmount },
                    { name: 'Est. returns', value: estReturns }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="#1e3a5f" />
                  <Cell fill="#c5a059" />
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full max-w-xs space-y-4 mb-12">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                <span className="text-gray-500 text-sm">Invested amount</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(investedAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-gold rounded-full"></div>
                <span className="text-gray-500 text-sm">Est. returns</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(estReturns)}</span>
            </div>
          </div>

          <button 
            onClick={openModal}
            className="w-48 bg-brand-blue hover:bg-[#152a45] text-white py-3 rounded font-bold transition-colors"
          >
            INVEST NOW
          </button>
        </div>
      </div>
    </div>
  );
};

const RetirementCalculator = ({ openModal }: { openModal: () => void }) => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);
  const [inflation, setInflation] = useState(6);
  const [preRetirementReturn, setPreRetirementReturn] = useState(11);
  const [postRetirementReturn, setPostRetirementReturn] = useState(7);
  const [existingFund, setExistingFund] = useState(500000);

  // Simplified calculation for visual purposes
  const yearsToRetire = Math.max(0, retirementAge - currentAge);
  const yearsInRetirement = Math.max(0, lifeExpectancy - retirementAge);
  
  const futureMonthlyExpense = monthlyIncome * Math.pow(1 + inflation / 100, yearsToRetire);
  const annualIncomeRequired = futureMonthlyExpense * 12;
  
  // Very rough approximation for corpus required
  const realReturn = ((1 + postRetirementReturn / 100) / (1 + inflation / 100)) - 1;
  const corpusRequired = annualIncomeRequired * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-2xl font-serif text-gray-900 mb-2">Retirement Planning Calculator</h3>
      <p className="text-sm text-gray-600 mb-6">Estimate your Retirement Corpus based on your expenses & the monthly investment required to achieve it.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Current Age</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">Years</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={currentAge} onChange={setCurrentAge} min={18} max={75} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} min="18" max="75" step="1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Desired Retirement Age</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">Years</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={retirementAge} onChange={setRetirementAge} min={40} max={80} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} min="40" max="80" step="1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Life Expectancy</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">Years</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={lifeExpectancy} onChange={setLifeExpectancy} min={65} max={100} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={lifeExpectancy} onChange={e => setLifeExpectancy(Number(e.target.value))} min="65" max="100" step="1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Monthly Income Required in Retirement Years</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-32">
                <span className="text-xs text-gray-500 mr-2">₹</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={monthlyIncome} onChange={setMonthlyIncome} min={10000} max={1000000} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={monthlyIncome} onChange={e => setMonthlyIncome(Number(e.target.value))} min="10000" max="1000000" step="1000" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Expected Inflation Rate (%)</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">%</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={inflation} onChange={setInflation} min={3} max={10} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={inflation} onChange={e => setInflation(Number(e.target.value))} min="3" max="10" step="0.1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Expected Return on Investment (Pre-retirement)</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">%</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={preRetirementReturn} onChange={setPreRetirementReturn} min={4} max={18} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={preRetirementReturn} onChange={e => setPreRetirementReturn(Number(e.target.value))} min="4" max="18" step="0.1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Expected Return on Investment (Post-retirement)</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">%</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={postRetirementReturn} onChange={setPostRetirementReturn} min={3} max={12} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={postRetirementReturn} onChange={e => setPostRetirementReturn(Number(e.target.value))} min="3" max="12" step="0.1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Existing Retirement Fund</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-32">
                <span className="text-xs text-gray-500 mr-2">₹</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={existingFund} onChange={setExistingFund} min={0} max={200000000} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={existingFund} onChange={e => setExistingFund(Number(e.target.value))} min="0" max="200000000" step="10000" />
          </div>

          <button 
            onClick={openModal}
            className="w-full bg-brand-blue hover:bg-[#152a45] text-white py-3 rounded font-bold transition-colors"
          >
            Want us to build a personalized plan around this?
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-64 h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Annual Income Required', value: annualIncomeRequired },
                    { name: 'Total Corpus Required', value: corpusRequired }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="#1e3a5f" />
                  <Cell fill="#c5a059" />
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full max-w-sm space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                <span className="text-gray-500 text-sm">Annual Income Required</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(annualIncomeRequired)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-gold rounded-full"></div>
                <span className="text-gray-500 text-sm">Total Corpus Required</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(corpusRequired)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InflationCalculator = ({ openModal }: { openModal: () => void }) => {
  const [currentExpenses, setCurrentExpenses] = useState(50000);
  const [inflationRate, setInflationRate] = useState(6);
  const [timePeriod, setTimePeriod] = useState(10);

  const futureCost = currentExpenses * Math.pow(1 + inflationRate / 100, timePeriod);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-2xl font-serif text-gray-900 mb-2">Inflation Calculator</h3>
      <p className="text-sm text-gray-600 mb-6">Calculate the impact of inflation on your current expenses and future goals.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Value of Current Expenses</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-32">
                <span className="text-xs text-gray-500 mr-2">₹</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={currentExpenses} onChange={setCurrentExpenses} min={1000} max={1000000} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={currentExpenses} onChange={e => setCurrentExpenses(Number(e.target.value))} min="1000" max="1000000" step="500" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Annual Inflation Rate</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">%</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={inflationRate} onChange={setInflationRate} min={1} max={12} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} min="1" max="12" step="0.1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Time Period</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">Years</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={timePeriod} onChange={setTimePeriod} min={1} max={40} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={timePeriod} onChange={e => setTimePeriod(Number(e.target.value))} min="1" max="40" step="1" />
          </div>

          <div className="bg-brand-light rounded-lg p-4 flex justify-between items-center mt-4 mb-4">
            <span className="text-gray-700 font-medium">Future Cost</span>
            <span className="text-xl font-bold text-brand-blue">{formatCurrency(futureCost)}</span>
          </div>

          <button 
            onClick={openModal}
            className="w-full bg-brand-blue hover:bg-[#152a45] text-white py-3 rounded font-bold transition-colors"
          >
            PLAN FOR THIS GOAL
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-64 h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Value of Current Expenses', value: currentExpenses },
                    { name: 'Future Cost', value: futureCost }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="#1e3a5f" />
                  <Cell fill="#c5a059" />
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full max-w-sm space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                <span className="text-gray-500 text-sm">Value of Current Expenses</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(currentExpenses)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-gold rounded-full"></div>
                <span className="text-gray-500 text-sm">Future Cost</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(futureCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SWPCalculator = ({ openModal }: { openModal: () => void }) => {
  const [swpType, setSwpType] = useState<'monthly' | 'yearly'>('monthly');
  const [investmentValue, setInvestmentValue] = useState(2500000);
  const [swpAmount, setSwpAmount] = useState(25000);
  const [duration, setDuration] = useState(15);
  const [rateOfReturn, setRateOfReturn] = useState(8);

  const handleTypeChange = (type: 'monthly' | 'yearly') => {
    if (type === 'monthly' && swpType === 'yearly') {
      setSwpAmount(Math.max(1000, Math.min(1000000, Math.round(swpAmount / 12))));
    } else if (type === 'yearly' && swpType === 'monthly') {
      setSwpAmount(Math.max(12000, Math.min(12000000, swpAmount * 12)));
    }
    setSwpType(type);
  };

  const investmentStep = investmentValue >= 10000000 ? 100000 : investmentValue >= 1000000 ? 50000 : 10000;
  const swpAmountStep = swpType === 'monthly' 
    ? (swpAmount >= 100000 ? 5000 : 500)
    : (swpAmount >= 1000000 ? 50000 : 5000);

  // Calculate SWP accurately
  const calculateSWP = () => {
    const n = swpType === 'monthly' ? duration * 12 : duration;
    const r = swpType === 'monthly' ? rateOfReturn / 12 / 100 : rateOfReturn / 100;
    const totalWithdrawnAmount = swpAmount * n;
    
    let calcFinalValue = 0;
    if (r === 0) {
      calcFinalValue = investmentValue - totalWithdrawnAmount;
    } else {
      calcFinalValue = investmentValue * Math.pow(1 + r, n) - swpAmount * ((Math.pow(1 + r, n) - 1) / r);
    }
    
    const finalValue = Math.max(0, calcFinalValue);
    // If corpus depletes, interest calculation is an approximation for the simplified view
    const totalInterest = Math.max(0, finalValue + totalWithdrawnAmount - investmentValue);
    
    return { finalValue, totalInterest };
  };

  const { finalValue, totalInterest } = calculateSWP();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-2xl font-serif text-gray-900 mb-2">Systematic Withdrawal Plan (SWP) Calculator</h3>
      <p className="text-sm text-gray-600 mb-6">Calculate the final value of an investment after withdrawing a fixed amount regularly while considering the interest earned from the investment.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex bg-gray-100 rounded-full p-1 w-max mb-6">
            <button 
              onClick={() => handleTypeChange('monthly')}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors ${swpType === 'monthly' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              SWP (Monthly)
            </button>
            <button 
              onClick={() => handleTypeChange('yearly')}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-colors ${swpType === 'yearly' ? 'bg-brand-blue text-white' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              SWP (Yearly)
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Investment Value</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-32">
                <span className="text-xs text-gray-500 mr-2">₹</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={investmentValue} onChange={setInvestmentValue} min={50000} max={200000000} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={investmentValue} onChange={e => setInvestmentValue(Number(e.target.value))} min="50000" max="200000000" step={investmentStep} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">{swpType === 'monthly' ? 'SWP Amount (Monthly)' : 'SWP Amount (Yearly)'}</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-32">
                <span className="text-xs text-gray-500 mr-2">₹</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={swpAmount} onChange={setSwpAmount} min={swpType === 'monthly' ? 1000 : 12000} max={swpType === 'monthly' ? 1000000 : 12000000} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={swpAmount} onChange={e => setSwpAmount(Number(e.target.value))} min={swpType === 'monthly' ? 1000 : 12000} max={swpType === 'monthly' ? 1000000 : 12000000} step={swpAmountStep} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Duration (Years)</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">Years</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={duration} onChange={setDuration} min={1} max={40} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={duration} onChange={e => setDuration(Number(e.target.value))} min="1" max="40" step="1" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-900">Rate of Return</label>
              <div className="flex items-center border border-gray-200 rounded px-2 py-1 w-24">
                <span className="text-xs text-gray-500 mr-2">%</span>
                <FormattedNumberInput className="w-full text-right focus:outline-none text-sm font-semibold" value={rateOfReturn} onChange={setRateOfReturn} min={1} max={15} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={rateOfReturn} onChange={e => setRateOfReturn(Number(e.target.value))} min="1" max="15" step="0.1" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center border border-gray-100">
          <div className="w-64 h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Final Investment Value', value: Math.max(0, finalValue) },
                    { name: 'Total Interest Earned', value: Math.max(0, totalInterest) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="#1e3a5f" />
                  <Cell fill="#c5a059" />
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                <span className="text-gray-500 text-sm">Final Investment Value</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(Math.max(0, finalValue))}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-gold rounded-full"></div>
                <span className="text-gray-500 text-sm">Total Interest Earned</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(Math.max(0, totalInterest))}</span>
            </div>
          </div>

          <button 
            onClick={openModal}
            className="w-full bg-brand-blue hover:bg-[#152a45] text-white py-3 rounded font-bold transition-colors"
          >
            PLAN YOUR WITHDRAWALS
          </button>
        </div>
      </div>
    </div>
  );
};

const FDCalculator = ({ openModal }: { openModal: () => void }) => {
  const [investment, setInvestment] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(3);

  const estReturns = investment * Math.pow(1 + rate / 100, years) - investment;
  const totalValue = investment + estReturns;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-2xl font-serif text-gray-900 mb-6">FD Calculator</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Total investment</label>
              <div className="flex items-center border border-gray-200 rounded px-3 py-1">
                <span className="text-gray-500 mr-1">₹</span>
                <FormattedNumberInput className="w-24 text-right bg-transparent focus:outline-none font-semibold" value={investment} onChange={setInvestment} min={1000} max={100000000} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={investment} onChange={e => setInvestment(Number(e.target.value))} min="1000" max="100000000" step="1000" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Rate of interest (p.a)</label>
              <div className="flex items-center border border-gray-200 rounded px-3 py-1">
                <FormattedNumberInput className="w-16 text-right bg-transparent focus:outline-none font-semibold" value={rate} onChange={setRate} min={3} max={10} />
                <span className="text-gray-500 ml-1">%</span>
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={rate} onChange={e => setRate(Number(e.target.value))} min="3" max="10" step="0.05" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Time period</label>
              <div className="flex items-center border border-gray-200 rounded px-3 py-1">
                <span className="text-gray-500 mr-2">Years</span>
                <FormattedNumberInput className="w-16 text-right bg-transparent focus:outline-none font-semibold" value={years} onChange={setYears} min={0.25} max={10} />
              </div>
            </div>
            <input type="range" className="w-full accent-brand-blue" value={years} onChange={e => setYears(Number(e.target.value))} min="0.25" max="10" step="0.25" />
          </div>

          <div className="pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Invested amount</span>
              <span className="font-semibold text-gray-900">{formatCurrency(investment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Est. returns</span>
              <span className="font-semibold text-gray-900">{formatCurrency(estReturns)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total value</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <button 
            onClick={openModal}
            className="w-40 bg-brand-blue hover:bg-[#152a45] text-white py-3 rounded font-bold transition-colors"
          >
            INVEST NOW
          </button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-64 h-64 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Total investment', value: investment },
                    { name: 'Total returns', value: estReturns }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="#1e3a5f" />
                  <Cell fill="#c5a059" />
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full max-w-sm space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-blue rounded-full"></div>
                <span className="text-gray-500 text-sm">Total investment</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(investment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-brand-gold rounded-full"></div>
                <span className="text-gray-500 text-sm">Total returns</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(estReturns)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





import TaxSavingCalculator from './TaxSavingCalculator';

export default function CalculatorsSection({ openModal }: { openModal: () => void }) {
  const [activeTab, setActiveTab] = useState('SIP');

  const tabs = ['SIP', 'Retirement', 'Inflation', 'SWP', 'Tax Saving', 'FD'];

  return (
    <div id="calculators" className="space-y-8 scroll-mt-24">
      <div className="text-center">
        <h2 className="text-3xl font-serif text-gray-900 mb-2">Financial Calculators</h2>
        <h3 className="text-xl text-gray-600 font-serif italic">Plan your financial future</h3>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-brand-blue text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-gold hover:text-brand-gold'
            }`}
          >
            {tab} Calculator
          </button>
        ))}
      </div>

      <div className="transition-all duration-500">
        {activeTab === 'SIP' && <SIPCalculator openModal={openModal} />}
        {activeTab === 'Retirement' && <RetirementCalculator openModal={openModal} />}
        {activeTab === 'Inflation' && <InflationCalculator openModal={openModal} />}
        {activeTab === 'SWP' && <SWPCalculator openModal={openModal} />}
        {activeTab === 'Tax Saving' && <TaxSavingCalculator openModal={openModal} />}
        {activeTab === 'FD' && <FDCalculator openModal={openModal} />}
      </div>
    </div>
  );
}
