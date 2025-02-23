interface FinancialHealthProps {
  userDetails: {
    monthlySalary: string;
    workExperience: string;
    occupation: string;
    age: string;
  };
  loans: Array<{
    principalAmount: string;
    minimumPayment: string;
    interestRate: string;
    loanDuration: string;
  }>;
}

export default function FinancialHealthStatus({ userDetails, loans }: FinancialHealthProps) {
  // Financial Calculations
  const monthlyIncome = parseFloat(userDetails.monthlySalary);
  const annualIncome = monthlyIncome * 12;
  const totalDebt = loans.reduce((sum, loan) => sum + parseFloat(loan.principalAmount), 0);
  const monthlyDebtPayments = loans.reduce((sum, loan) => sum + parseFloat(loan.minimumPayment), 0);
  const age = parseInt(userDetails.age);
  const workExp = parseInt(userDetails.workExperience);

  // Age-based considerations
  const retirementAge = 60;
  const yearsToRetirement = Math.max(0, retirementAge - age);
  const isNearRetirement = age > 50;
  const isRetired = age >= retirementAge;

  // Calculate ratios
  const debtToIncomeRatio = (monthlyDebtPayments / monthlyIncome) * 100;
  const totalDebtToIncomeRatio = (totalDebt / annualIncome) * 100;

  // Calculate maximum loan eligibility with age and debt considerations
  const calculateMaxLoanAmount = () => {
    // Base calculation
    const maxMonthlyPayment = (monthlyIncome * 0.5) - monthlyDebtPayments;
    
    // Age factor (reduces eligible amount as age increases)
    const ageFactor = Math.max(0, (retirementAge - age) / 35); // Normalized to 1 for young adults
    
    // Debt burden factor (reduces eligible amount as existing debt increases)
    const debtBurdenFactor = Math.max(0, 1 - (totalDebtToIncomeRatio / 100));
    
    // Maximum loan term based on age
    const maxTermYears = Math.min(yearsToRetirement, 30);
    const maxTermMonths = maxTermYears * 12;
    
    // Average interest rate from existing loans or default
    const averageInterestRate = loans.length > 0 
      ? loans.reduce((sum, loan) => sum + parseFloat(loan.interestRate), 0) / loans.length 
      : 10;

    // If near retirement or high debt, severely restrict or eliminate new loan eligibility
    if (isRetired || totalDebtToIncomeRatio > 80) {
      return 0;
    }

    if (isNearRetirement || totalDebtToIncomeRatio > 60) {
      return maxMonthlyPayment * 12; // Only allow 1 year of payments worth of loans
    }

    // Calculate maximum loan amount with all factors
    const maxLoan = (maxMonthlyPayment * maxTermMonths * ageFactor * debtBurdenFactor) / 
      (1 + (averageInterestRate / 100));

    return Math.max(0, maxLoan);
  };

  const maxAdditionalLoan = calculateMaxLoanAmount();

  // Calculate financial health score with age considerations
  const calculateHealthScore = () => {
    let score = 100;

    // Age-based deductions
    if (isRetired) score -= 30;
    else if (isNearRetirement) score -= 15;

    // Debt-to-Income ratio deductions
    if (debtToIncomeRatio > 50) score -= 30;
    else if (debtToIncomeRatio > 40) score -= 20;
    else if (debtToIncomeRatio > 30) score -= 10;

    // Total Debt to Annual Income ratio deductions
    if (totalDebtToIncomeRatio > 200) score -= 30;
    else if (totalDebtToIncomeRatio > 150) score -= 20;
    else if (totalDebtToIncomeRatio > 100) score -= 10;

    // Work experience consideration
    if (workExp < 2) score -= 15;

    return Math.max(0, score);
  };

  const healthScore = calculateHealthScore();

  // Get health status based on score and age
  const getHealthStatus = () => {
    // Adjust thresholds based on age
    const thresholds = isNearRetirement 
      ? { excellent: 85, good: 70, fair: 50 }  // Stricter thresholds for older individuals
      : { excellent: 80, good: 60, fair: 40 };  // Standard thresholds

    if (healthScore >= thresholds.excellent) return {
      status: 'Excellent',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    };
    if (healthScore >= thresholds.good) return {
      status: 'Good',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    };
    if (healthScore >= thresholds.fair) return {
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

  // Generate age-specific recommendations
  const getRecommendations = () => {
    const recommendations = [];

    if (isRetired) {
      recommendations.push("• Focus on managing existing debt rather than taking new loans");
      recommendations.push("• Consider downsizing or debt consolidation options");
    } else if (isNearRetirement) {
      recommendations.push("• Prioritize debt reduction before retirement");
      recommendations.push("• Avoid long-term loan commitments");
      if (debtToIncomeRatio > 30) {
        recommendations.push("• Consider accelerating debt payments to be debt-free by retirement");
      }
    } else {
      if (debtToIncomeRatio > 43) {
        recommendations.push("• Work on reducing current debt before considering new loans");
      }
      if (workExp <= 2) {
        recommendations.push("• Build more work experience to improve loan terms");
      }
      if (monthlyIncome <= 30000) {
        recommendations.push("• Focus on increasing income before taking on additional debt");
      }
    }

    recommendations.push("• Maintain timely payments on existing loans");
    return recommendations;
  };

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
              Based on your age, income, debt, and employment history
            </p>
          </div>
          <div className={`${healthStatus.color} text-2xl font-bold`}>
            {healthScore}/100
          </div>
        </div>

        {/* Age Warning for Near-Retirement */}
        {isNearRetirement && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Age Consideration: {isRetired ? 
                "You are past retirement age. Focus on debt management rather than new loans." :
                `You are ${yearsToRetirement} years from retirement. Consider this when taking on new debt.`}
            </p>
          </div>
        )}
        
        {/* Key Metrics */}
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
            <p className="text-gray-400 text-sm">Debt-to-Income Ratio</p>
            <p className="text-white text-lg font-semibold">{debtToIncomeRatio.toFixed(1)}%</p>
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
            Based on your age, income, and current debt obligations
          </p>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h5 className="text-blue-400 font-medium mb-2">Recommendations</h5>
          <ul className="text-gray-400 text-sm space-y-2">
            {getRecommendations().map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 
