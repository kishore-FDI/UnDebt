interface FinancialHealthProps {
  userDetails: {
    monthlySalary: string;
    workExperience: string;
    occupation: string;
  };
  loans: Array<{
    principalAmount: string;
    minimumPayment: string;
    interestRate: string;
  }>;
}

export default function FinancialHealthStatus({ userDetails, loans }: FinancialHealthProps) {
  // Calculate key financial metrics
  const monthlyIncome = parseFloat(userDetails.monthlySalary);
  const annualIncome = monthlyIncome * 12;
  const totalDebt = loans.reduce((sum, loan) => sum + parseFloat(loan.principalAmount), 0);
  const monthlyDebtPayments = loans.reduce((sum, loan) => sum + parseFloat(loan.minimumPayment), 0);
  
  // Calculate ratios
  const debtToIncomeRatio = (monthlyDebtPayments / monthlyIncome) * 100;
  const totalDebtToIncomeRatio = (totalDebt / annualIncome) * 100;

  // Determine maximum additional loan amount
  // Using 50-30-20 rule: 50% for needs (including debt), 30% discretionary, 20% savings
  const maxMonthlyPayment = (monthlyIncome * 0.5) - monthlyDebtPayments;
  const workExp = parseInt(userDetails.workExperience);
  
  // Calculate maximum loan eligibility
  // Using a basic formula: (Max monthly payment * Loan term) / (1 + average interest rate)
  const averageInterestRate = loans.reduce((sum, loan) => sum + parseFloat(loan.interestRate), 0) / loans.length || 10;
  const maxLoanTerm = Math.min(workExp * 12, 360); // Max term based on work experience, capped at 30 years
  const maxAdditionalLoan = (maxMonthlyPayment * maxLoanTerm) / (1 + (averageInterestRate / 100));

  // Determine financial health status
  const getHealthStatus = () => {
    if (debtToIncomeRatio <= 30) return {
      status: 'Excellent',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    };
    if (debtToIncomeRatio <= 40) return {
      status: 'Good',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    };
    if (debtToIncomeRatio <= 50) return {
      status: 'Fair',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20'
    };
    return {
      status: 'At Risk',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    };
  };

  const healthStatus = getHealthStatus();

  // Loan eligibility criteria
  const eligibilityCriteria = [
    {
      criterion: 'Debt-to-Income Ratio',
      value: `${debtToIncomeRatio.toFixed(1)}%`,
      target: '< 43%',
      passed: debtToIncomeRatio < 43
    },
    {
      criterion: 'Work Experience',
      value: `${workExp} years`,
      target: '> 2 years',
      passed: workExp > 2
    },
    {
      criterion: 'Monthly Income',
      value: `₹${monthlyIncome.toLocaleString()}`,
      target: '> ₹30,000',
      passed: monthlyIncome > 30000
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Financial Health Status */}
      <div className={`p-6 rounded-lg ${healthStatus.bgColor} ${healthStatus.borderColor} border`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className={`text-lg font-semibold ${healthStatus.color}`}>
              Financial Health Status: {healthStatus.status}
            </h4>
            <p className="text-gray-400 text-sm mt-1">
              Based on your income, debt, and employment history
            </p>
          </div>
          <div className={`${healthStatus.color} text-2xl font-bold`}>
            {debtToIncomeRatio.toFixed(1)}%
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">Monthly Income</p>
            <p className="text-white text-lg font-semibold">₹{monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">Total Debt</p>
            <p className="text-white text-lg font-semibold">₹{totalDebt.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-sm">Monthly Debt Payments</p>
            <p className="text-white text-lg font-semibold">₹{monthlyDebtPayments.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Loan Eligibility Section */}
      <div className="p-6 bg-white/[0.03] rounded-lg border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Additional Loan Eligibility</h4>
        
        {/* Maximum Loan Amount */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">Maximum Additional Loan Amount</p>
          <p className="text-2xl font-bold text-green-400">
            ₹{Math.max(0, maxAdditionalLoan).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Based on your income and current debt obligations
          </p>
        </div>

        {/* Eligibility Criteria */}
        <div className="space-y-3">
          <p className="text-white font-medium">Eligibility Criteria</p>
          {eligibilityCriteria.map((criteria, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white">{criteria.criterion}</p>
                <p className="text-gray-400 text-sm">Current: {criteria.value}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Target: {criteria.target}</span>
                <span className={criteria.passed ? 'text-green-400' : 'text-red-400'}>
                  {criteria.passed ? '✓' : '✗'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h5 className="text-blue-400 font-medium mb-2">Recommendations</h5>
          <ul className="text-gray-400 text-sm space-y-2">
            {debtToIncomeRatio > 43 && (
              <li>• Consider reducing existing debt before taking on new loans</li>
            )}
            {workExp <= 2 && (
              <li>• Building more work experience will improve loan eligibility</li>
            )}
            {monthlyIncome <= 30000 && (
              <li>• Increasing income through additional sources could improve eligibility</li>
            )}
            <li>• Maintain timely payments on existing loans to improve creditworthiness</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 