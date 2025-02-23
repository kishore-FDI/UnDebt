'use client';
import Navbar from '@/components/Navbar/Navbar';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis
} from 'recharts';

interface Loan {
  debtName: string;
  principalAmount: string;
  interestRate: string;
  loanDuration: string;
  minimumPayment: string;
  loanType: string;
  paymentDueDate: string;
}

interface UserDetails {
  fullName: string;
  occupation: string;
  monthlySalary: string;
  companyName: string;
  workExperience: string;
  numberOfLoans: string;
  aadharNumber: string;
  panNumber: string;
}

interface CalculationData {
  loans: Loan[];
  userDetails: UserDetails;
  _id: string;
  createdAt: string;
}

interface MonthlyDataPoint {
  month: number;
  totalBalance: number;
  [key: string]: number;  // This allows for dynamic loan properties
}

interface MetricsResult {
  debtToIncomeRatio: number;
  loanMetrics: Array<{
    name: string;
    principal: number;
    totalInterest: number;
    monthlyPayment: number;
    paymentPercentage: number;
  }>;
  totalMonthlyPayment: number;
}

interface ClonedLoan {
  debtName: string;
  principalAmount: string;
  interestRate: string;
  loanDuration: string;
  loanType: string;
  paymentDueDate: string;
  currentBalance: number;
  rate: number;
  minimumPayment: number;
}

interface StrategyResult {
  data: Array<{ month: number; totalBalance: number }>;
  totalInterest: number;
}

interface Strategies {
  avalanche: StrategyResult;
  snowball: StrategyResult;
  hybrid: StrategyResult;
}

interface PayoffScenario {
  extraAmount: number;
  months: number;
  totalInterestPaid: number;
  totalSaved: number;
}

interface ClonedPayoffLoan {
  currentBalance: number;
  rate: number;
  minimumPayment: number;
  principalAmount: string;
  interestRate: string;
}

interface InterestClassification {
  level: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

// Colors for pie chart
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#ff6b6b', '#4ecdc4'];

interface PieDataItem {
  name: string;
  value: number;
  category: 'income' | 'debt';
}

interface ComparisonData {
  monthsDiff: number;
  interestDiff: number;
}

// Create a wrapper component for the search params functionality
function DashboardContent() {
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const calculationId = searchParams.get('id');

  useEffect(() => {
    const fetchCalculation = async () => {
      try {
        const response = await fetch(`/api/data/${calculationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch calculation data');
        }
        const data = await response.json();
        setCalculationData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (calculationId) {
      fetchCalculation();
    }
  }, [calculationId]);

  // Calculate monthly payments data for line chart
  const calculateMonthlyPayments = (loans: Loan[]) => {
    const monthlyData: MonthlyDataPoint[] = [];
    const maxDuration = Math.max(...loans.map(loan => parseInt(loan.loanDuration)));

    for (let month = 0; month <= maxDuration; month++) {
      const dataPoint: MonthlyDataPoint = {
        month,
        totalBalance: 0,
      };

      loans.forEach((loan, index) => {
        const principal = parseFloat(loan.principalAmount);
        const rate = parseFloat(loan.interestRate) / 100 / 12;
        const duration = parseInt(loan.loanDuration);
        
        if (month <= duration) {
          const monthlyPayment = parseFloat(loan.minimumPayment);
          const remainingBalance = principal * Math.pow(1 + rate, duration) * 
            (1 - Math.pow(1 + rate, month)) / (1 - Math.pow(1 + rate, duration));
          
          dataPoint[`loan${index + 1}`] = remainingBalance;
          dataPoint.totalBalance += remainingBalance;
        }
      });

      monthlyData.push(dataPoint);
    }

    return monthlyData;
  };

  // Calculate additional metrics
  const calculateMetrics = (loans: Loan[], monthlySalary: string): MetricsResult => {
    const salary = parseFloat(monthlySalary);
    const totalMonthlyPayment = loans.reduce((sum: number, loan: Loan) => 
      sum + parseFloat(loan.minimumPayment), 0);
    
    const debtToIncomeRatio = (totalMonthlyPayment / salary) * 100;
    
    const loanMetrics = loans.map(loan => {
      const principal = parseFloat(loan.principalAmount);
      const rate = parseFloat(loan.interestRate) / 100 / 12;
      const duration = parseInt(loan.loanDuration);
      const monthlyPayment = parseFloat(loan.minimumPayment);
      
      const totalPayment = monthlyPayment * duration;
      const totalInterest = totalPayment - principal;
      
      return {
        name: loan.debtName,
        principal,
        totalInterest,
        monthlyPayment,
        paymentPercentage: (monthlyPayment / salary) * 100
      };
    });

    return {
      debtToIncomeRatio,
      loanMetrics,
      totalMonthlyPayment
    };
  };

  type StrategyType = keyof Strategies;

  // Calculate repayment strategies
  const calculateRepaymentStrategies = (loans: Loan[], monthlyBudget: number): Strategies => {
    const calculateMonthlyInterest = (principal: number, rate: number): number => {
      return principal * (rate / 100 / 12);
    };

    const getLoansClone = (): ClonedLoan[] => loans.map(loan => ({
      ...loan,
      currentBalance: parseFloat(loan.principalAmount),
      rate: parseFloat(loan.interestRate),
      minimumPayment: parseFloat(loan.minimumPayment)
    }));

    const totalMinPayment = loans.reduce((sum, loan) => sum + parseFloat(loan.minimumPayment), 0);
    const extraPayment = monthlyBudget - totalMinPayment;

    // Calculate strategies
    const strategies: Strategies = {
      avalanche: { data: [], totalInterest: 0 },
      snowball: { data: [], totalInterest: 0 },
      hybrid: { data: [], totalInterest: 0 }
    };

    // Simulate each strategy
    (Object.keys(strategies) as StrategyType[]).forEach(strategy => {
      const loansClone = getLoansClone();
      let month = 0;
      let totalBalance = loansClone.reduce((sum, loan) => sum + loan.currentBalance, 0);
      
      while (totalBalance > 0 && month < 360) { // 30 years max
        let monthlyData = {
          month,
          totalBalance
        };

        // Apply minimum payments and calculate interest
        loansClone.forEach(loan => {
          if (loan.currentBalance > 0) {
            const interest = calculateMonthlyInterest(loan.currentBalance, loan.rate);
            strategies[strategy].totalInterest += interest;
            loan.currentBalance += interest;
            
            const payment = Math.min(loan.minimumPayment, loan.currentBalance);
            loan.currentBalance -= payment;
          }
        });

        // Apply extra payment according to strategy
        if (extraPayment > 0) {
          let remainingExtra = extraPayment;
          const activeLoansSorted = loansClone
            .filter(loan => loan.currentBalance > 0)
            .sort((a, b) => {
              switch(strategy) {
                case 'avalanche':
                  return b.rate - a.rate;
                case 'snowball':
                  return a.currentBalance - b.currentBalance;
                case 'hybrid':
                  return (b.rate * b.currentBalance) - (a.rate * a.currentBalance);
                default:
                  return 0;
              }
            });

          if (activeLoansSorted.length > 0) {
            const targetLoan = activeLoansSorted[0];
            const extraPaymentApplied = Math.min(remainingExtra, targetLoan.currentBalance);
            targetLoan.currentBalance -= extraPaymentApplied;
          }
        }

        totalBalance = loansClone.reduce((sum, loan) => sum + loan.currentBalance, 0);
        monthlyData.totalBalance = totalBalance;
        strategies[strategy].data.push(monthlyData);
        month++;
      }
    });

    return strategies;
  };

  // Add this helper function near the top with other calculation functions
  const calculateEarlyPayoff = (loans: Loan[], additionalPayments: number[]): PayoffScenario[] => {
    const scenarios = additionalPayments.map((extraAmount: number) => {
      const loansClone: ClonedPayoffLoan[] = loans.map(loan => ({
        currentBalance: parseFloat(loan.principalAmount),
        rate: parseFloat(loan.interestRate),
        minimumPayment: parseFloat(loan.minimumPayment),
        principalAmount: loan.principalAmount,
        interestRate: loan.interestRate
      }));

      let months = 0;
      let totalInterestPaid = 0;
      let totalBalance = loansClone.reduce((sum, loan) => sum + loan.currentBalance, 0);
      const originalBalance = totalBalance;

      // Distribute extra amount proportionally based on loan balance
      while (totalBalance > 0 && months < 360) {
        loansClone.forEach(loan => {
          if (loan.currentBalance > 0) {
            // Calculate interest
            const interest = (loan.currentBalance * loan.rate) / 100 / 12;
            totalInterestPaid += interest;
            loan.currentBalance += interest;

            // Calculate extra payment for this loan
            const loanShare = loan.currentBalance / totalBalance;
            const extraForLoan = extraAmount * loanShare;

            // Apply payment
            const totalPayment = Math.min(
              loan.currentBalance,
              loan.minimumPayment + extraForLoan
            );
            loan.currentBalance -= totalPayment;
          }
        });

        totalBalance = loansClone.reduce((sum, loan) => sum + loan.currentBalance, 0);
        months++;
      }

      return {
        extraAmount,
        months,
        totalInterestPaid,
        totalSaved: (originalBalance * months) - totalInterestPaid
      };
    });

    return scenarios;
  };

  // Add this helper function to classify interest burden
  const getInterestClassification = (totalInterest: number, salary: string): InterestClassification => {
    const monthlyInterest = totalInterest / 12;
    const interestToSalaryRatio = (monthlyInterest / parseFloat(salary)) * 100;

    if (interestToSalaryRatio <= 10) {
      return {
        level: 'Excellent',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        description: 'Your interest burden is very manageable relative to your income.'
      };
    } else if (interestToSalaryRatio <= 20) {
      return {
        level: 'Good',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        description: 'Your interest payments are at a reasonable level.'
      };
    } else if (interestToSalaryRatio <= 30) {
      return {
        level: 'Moderate',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        description: 'Consider ways to reduce your interest burden.'
      };
    } else {
      return {
        level: 'High',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        description: 'Your interest burden is significant. Consider debt consolidation or refinancing options.'
      };
    }
  };

  const preparePieData = (loans: Loan[], monthlySalary: string): PieDataItem[] => {
    const annualSalary = parseFloat(monthlySalary) * 12;
    
    const totalLoanAmount = loans.reduce((sum: number, loan: Loan) => 
      sum + parseFloat(loan.principalAmount), 0
    );

    const data: PieDataItem[] = [
      {
        name: 'Annual Income',
        value: annualSalary,
        category: 'income'
      },
      ...loans.map(loan => ({
        name: loan.debtName,
        value: parseFloat(loan.principalAmount),
        category: 'debt' as const
      }))
    ];

    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0118]">
        <Navbar />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-white text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0118]">
        <Navbar />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  // Calculate monthly payments data
  const monthlyPaymentsData = calculationData ? calculateMonthlyPayments(calculationData.loans) : [];

  const metrics = calculationData ? 
    calculateMetrics(calculationData.loans, calculationData.userDetails.monthlySalary) : 
    null;

  // Calculate monthly budget
  const monthlyBudget = calculationData ? 
    parseFloat(calculationData.userDetails.monthlySalary) * 0.5 : // Assuming 50% of salary for debt repayment
    0;

  // Calculate repayment strategies
  const strategies = calculationData ?
    calculateRepaymentStrategies(calculationData.loans, monthlyBudget) :
    null;

  // In your DashboardContent component, add this before the return statement:
  const additionalPayments = [0, 5000, 10000, 15000, 20000];
  const payoffScenarios = calculationData ? 
    calculateEarlyPayoff(calculationData.loans, additionalPayments) : 
    [];

  return (
    <div className="min-h-screen bg-[#0A0118]">
      <Navbar />
      <div className="container mx-auto px-4 pt-32">
        {calculationData && (
          <div className="max-w-6xl mx-auto">
            {/* User Details Section */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Personal Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400">Full Name</p>
                  <p className="text-white text-lg">{calculationData.userDetails.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Occupation</p>
                  <p className="text-white text-lg">{calculationData.userDetails.occupation}</p>
                </div>
                <div>
                  <p className="text-gray-400">Monthly Salary</p>
                  <p className="text-white text-lg">₹{calculationData.userDetails.monthlySalary}</p>
                </div>
                <div>
                  <p className="text-gray-400">Company</p>
                  <p className="text-white text-lg">{calculationData.userDetails.companyName}</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Income vs Debt Distribution Pie Chart */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Income vs Debt Distribution</h3>
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={preparePieData(calculationData.loans, calculationData.userDetails.monthlySalary)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value, percent }) => 
                          ` (₹${(value/1000).toFixed(0)}k, ${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {preparePieData(calculationData.loans, calculationData.userDetails.monthlySalary)
                          .map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.category === 'income' ? '#4caf50' : COLORS[index % COLORS.length]}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth={2}
                            />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `₹${(value/1000).toFixed(0)}k`}
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.9)',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: '#fff' }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Add summary statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm">Annual Income</p>
                    <p className="text-green-400 font-bold text-lg">
                      ₹{(parseFloat(calculationData.userDetails.monthlySalary) * 12).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm">Total Debt</p>
                    <p className="text-red-400 font-bold text-lg">
                      ₹{calculationData.loans.reduce((sum, loan) => 
                        sum + parseFloat(loan.principalAmount), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.03] rounded-lg border border-white/10">
                    <p className="text-gray-400 text-sm">Debt-to-Income Ratio</p>
                    <p className={`font-bold text-lg ${
                      (calculationData.loans.reduce((sum, loan) => 
                        sum + parseFloat(loan.principalAmount), 0) / 
                        (parseFloat(calculationData.userDetails.monthlySalary) * 12)) <= 1 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {((calculationData.loans.reduce((sum, loan) => 
                        sum + parseFloat(loan.principalAmount), 0) / 
                        (parseFloat(calculationData.userDetails.monthlySalary) * 12)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Balance Progress - Redesigned */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Balance Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPaymentsData}>
                    <defs>
                      <linearGradient id="totalBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#ffffff60"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'Months', 
                        position: 'insideBottom', 
                        offset: -5,
                        fill: '#ffffff80'
                      }}
                    />
                    <YAxis 
                      stroke="#ffffff60"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      label={{ 
                        value: 'Balance (₹)', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: '#ffffff80'
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#ffffff' }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{
                        paddingBottom: '20px',
                        opacity: 0.8
                      }}
                    />
                    {calculationData.loans.map((loan, index) => (
                      <Line
                        key={index}
                        type="monotone"
                        dataKey={`loan${index + 1}`}
                        stroke={COLORS[index % COLORS.length]}
                        name={loan.debtName}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="totalBalance"
                      stroke="#fff"
                      strokeWidth={3}
                      name="Total Balance"
                      dot={false}
                      activeDot={{ r: 8 }}
                      fill="url(#totalBalance)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* New Visualizations Section */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-8">
              {/* Debt-to-Income Ratio - Updated colors */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Debt-to-Income Ratio</h3>
                {metrics && (
                  <div className="relative pt-4">
                    <div className="flex justify-between mb-2">
                      <span className={metrics.debtToIncomeRatio <= 30 ? 'text-green-400 font-semibold' : 'text-gray-400'}>Good</span>
                      <span className={metrics.debtToIncomeRatio > 30 && metrics.debtToIncomeRatio <= 40 ? 'text-yellow-400 font-semibold' : 'text-gray-400'}>Warning</span>
                      <span className={metrics.debtToIncomeRatio > 40 ? 'text-red-400 font-semibold' : 'text-gray-400'}>Critical</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ 
                          width: `${Math.min(metrics.debtToIncomeRatio, 100)}%`,
                          backgroundColor: metrics.debtToIncomeRatio > 40 ? '#ef4444' :
                                          metrics.debtToIncomeRatio > 30 ? '#eab308' : '#22c55e',
                          boxShadow: `0 0 20px ${
                            metrics.debtToIncomeRatio > 40 ? 'rgba(239, 68, 68, 0.5)' :
                            metrics.debtToIncomeRatio > 30 ? 'rgba(234, 179, 8, 0.5)' : 'rgba(34, 197, 94, 0.5)'
                          }`
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>0%</span>
                      <span>30%</span>
                      <span>40%</span>
                      <span>100%</span>
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-4xl font-bold" style={{
                        color: metrics.debtToIncomeRatio > 40 ? '#ef4444' :
                               metrics.debtToIncomeRatio > 30 ? '#eab308' : '#22c55e'
                      }}>
                        {metrics.debtToIncomeRatio.toFixed(1)}%
                      </p>
                      <p className="mt-2" style={{
                        color: metrics.debtToIncomeRatio > 40 ? '#fca5a5' :
                               metrics.debtToIncomeRatio > 30 ? '#fde047' : '#86efac'
                      }}>
                        {metrics.debtToIncomeRatio > 40 ? 'High Risk - Consider debt consolidation' :
                         metrics.debtToIncomeRatio > 30 ? 'Moderate Risk - Monitor spending' : 'Healthy - Keep it up!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Payment Distribution - New Bar Graph */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Payment Distribution</h3>
                {metrics && (
                  <div className="space-y-4">
                    {metrics.loanMetrics.map((loan, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{loan.name}</span>
                          <span className="text-gray-400">₹{loan.monthlyPayment.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${loan.paymentPercentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <div className="text-right text-xs text-gray-400 mt-1">
                          {loan.paymentPercentage.toFixed(1)}% of income
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/10 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">Total Monthly Payments</span>
                        <span className="text-gray-400">₹{metrics.totalMonthlyPayment.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interest vs Principal Comparison */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10 md:col-span-2">
              <h3 className="text-xl font-semibold text-white mb-4">Interest vs Principal</h3>
              {metrics && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.loanMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="name" stroke="#ffffff80" />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip 
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{ background: '#1a1a2e' }}
                    />
                    <Legend />
                    <Bar dataKey="principal" stackId="a" fill="#82ca9d" name="Principal" />
                    <Bar dataKey="totalInterest" stackId="a" fill="#ff8042" name="Total Interest" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Debt Repayment Strategies Comparison */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8 mt-5">
              <h3 className="text-xl font-semibold text-white mb-4">Debt Repayment Strategy Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#ffffff80"
                    label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    stroke="#ffffff80"
                    label={{ value: 'Balance (₹)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    contentStyle={{ background: '#1a1a2e' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    data={strategies?.avalanche.data}
                    dataKey="totalBalance"
                    stroke="#ff4d4d"
                    name="Avalanche Method"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    data={strategies?.snowball.data}
                    dataKey="totalBalance"
                    stroke="#4caf50"
                    name="Snowball Method"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    data={strategies?.hybrid.data}
                    dataKey="totalBalance"
                    stroke="#ffd700"
                    name="Hybrid Method"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Strategy Comparison Stats - Redesigned with Interest Classification */}
              <div className="mt-8 space-y-4">
                {Object.entries(strategies || {})
                  .sort(([stratA, dataA], [stratB, dataB]) => {
                    // Sort by total interest (lowest first)
                    return dataA.totalInterest - dataB.totalInterest;
                  })
                  .map(([strategy, data], index) => {
                  const optimalStrategy = index === 0; // First strategy after sorting is optimal

                  const comparisonData = !optimalStrategy ? {
                    monthsDiff: data.data.length - (
                      Object.values(strategies || {})
                        .reduce((min: StrategyResult, stratData: StrategyResult) => 
                          stratData.totalInterest < min.totalInterest ? stratData : min
                        , {totalInterest: Infinity, data: {length: 0}} as StrategyResult)
                        .data.length
                    ),
                    interestDiff: data.totalInterest - (
                      Object.values(strategies || {})
                        .reduce((min: StrategyResult, stratData: StrategyResult) => 
                          stratData.totalInterest < min.totalInterest ? stratData : min
                        , {totalInterest: Infinity} as StrategyResult)
                        .totalInterest
                    )
                  } as ComparisonData : null;

                  const interestClassification = getInterestClassification(
                    data.totalInterest,
                    calculationData.userDetails.monthlySalary
                  );

                  return (
                    <div 
                      key={strategy}
                      className={`p-6 rounded-lg border ${
                        optimalStrategy 
                          ? 'bg-green-500/10 border-green-500/20' 
                          : 'bg-white/[0.03] border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className={`text-lg font-semibold ${
                              optimalStrategy ? 'text-green-400' : 'text-white'
                            }`}>
                              {strategy.charAt(0).toUpperCase() + strategy.slice(1)} Method
                            </h4>
                            {optimalStrategy && (
                              <span className="text-sm px-2 py-0.5 bg-green-500/20 rounded-full text-green-400">
                                Optimal Strategy
                              </span>
                            )}
                            <span className={`text-sm px-2 py-0.5 ${interestClassification.bgColor} ${interestClassification.color} rounded-full`}>
                              {interestClassification.level} Interest Burden
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            {strategy === 'avalanche' && "Prioritizes high-interest debts first - typically saves the most money"}
                            {strategy === 'snowball' && "Focuses on smallest debts first - builds momentum through quick wins"}
                            {strategy === 'hybrid' && "Balances interest rates and loan sizes - can be optimal for mixed loan portfolios"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Time to Debt-Free</p>
                          <p className="text-white font-bold text-lg">
                            {Math.floor(data.data.length / 12)} years {data.data.length % 12} months
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Total Interest</p>
                          <p className={`font-bold text-lg ${interestClassification.color}`}>
                            ₹{data.totalInterest.toLocaleString(undefined, {
                              maximumFractionDigits: 0
                            })}
                          </p>
                          <p className={`text-xs mt-1 ${interestClassification.color}`}>
                            {((data.totalInterest / 12) / parseFloat(calculationData.userDetails.monthlySalary) * 100).toFixed(1)}% of monthly income
                          </p>
                        </div>
                        
                        {!optimalStrategy && comparisonData && (
                          <>
                            <div>
                              <p className="text-gray-400 text-sm">Extra Time vs Optimal</p>
                              <p className="text-red-400 font-bold text-lg">
                                +{Math.floor(comparisonData.monthsDiff / 12)} years {comparisonData.monthsDiff % 12} months
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-sm">Additional Interest vs Optimal</p>
                              <p className="text-red-400 font-bold text-lg">
                                +₹{comparisonData.interestDiff.toLocaleString(undefined, {
                                  maximumFractionDigits: 0
                                })}
                              </p>
                            </div>
                          </>
                        )}
                        
                        {optimalStrategy && (
                          <div className="col-span-2">
                            <p className="text-gray-400 text-sm">Interest Classification</p>
                            <p className={`text-sm ${interestClassification.color}`}>
                              {interestClassification.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Early Payoff Impact */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Early Payoff Impact</h3>
              <div className="mb-6">
                <p className="text-gray-400 text-sm">
                  See how paying a little extra each month can significantly reduce your loan duration and save money on interest.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Payoff Time Comparison */}
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={payoffScenarios}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis 
                        dataKey="extraAmount" 
                        stroke="#ffffff80"
                        tickFormatter={(value) => `+₹${value.toLocaleString()}`}
                      />
                      <YAxis 
                        stroke="#ffffff80"
                        label={{ 
                          value: 'Months to Debt-Free', 
                          angle: -90, 
                          position: 'insideCenter ',
                          fill: '#ffffff80' 
                        }}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'months' ? `${value} months` : `₹${value.toLocaleString()}`,
                          name === 'months' ? 'Time to Debt-Free' : 'Extra Monthly Payment'
                        ]}
                        contentStyle={{ 
                          backgroundColor: 'rgba(0,0,0,0.8)', 
                          border: '1px solid rgba(255,255,255,0.1)' 
                        }}
                      />
                      <Bar 
                        dataKey="months" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      >
                        {payoffScenarios.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={entry.extraAmount === 0 ? '#ef4444' : '#22c55e'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Savings Breakdown */}
                <div className="space-y-4">
                  {payoffScenarios.map((scenario, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg ${
                        scenario.extraAmount === 0 
                          ? 'bg-red-500/10 border border-red-500/20' 
                          : 'bg-green-500/10 border border-green-500/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">
                          {scenario.extraAmount === 0 
                            ? 'Current Plan' 
                            : `+₹${scenario.extraAmount.toLocaleString()}/month`}
                        </span>
                        <span className={`text-sm ${
                          scenario.extraAmount === 0 ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {scenario.months} months
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Total Interest</p>
                          <p className="text-white">₹{scenario.totalInterestPaid.toLocaleString(undefined, {
                            maximumFractionDigits: 0
                          })}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Potential Savings</p>
                          <p className={scenario.extraAmount === 0 ? 'text-red-400' : 'text-green-400'}>
                            {scenario.extraAmount === 0 ? '-' : 
                              `₹${scenario.totalSaved.toLocaleString(undefined, {
                                maximumFractionDigits: 0
                              })}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">Pro Tip</h4>
                    <p className="text-gray-400 text-sm">
                      Even a small increase in your monthly payment can significantly reduce your loan duration and save money on interest. Consider allocating any extra income or bonuses towards loan payments.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Loans Section */}
            <div className="space-y-6 pb-28">
              <h2 className="text-2xl font-bold text-white mb-6">Loan Details</h2>
              {calculationData.loans.map((loan, index) => (
                <div 
                  key={index}
                  className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {loan.debtName}
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-sm">
                        {loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Principal</p>
                      <p className="text-white">₹{loan.principalAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Interest Rate</p>
                      <p className="text-white">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white">{loan.loanDuration} months</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Min. Payment</p>
                      <p className="text-white">₹{loan.minimumPayment}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Dashboard component with Suspense
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0118]">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 pt-32">
          <div className="text-white text-center">Loading...</div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
