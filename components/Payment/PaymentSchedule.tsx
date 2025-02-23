import { format } from 'date-fns';

interface Payment {
  date: Date;
  loanName: string;
  amount: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
}

interface PaymentScheduleProps {
  loans: Array<{
    debtName: string;
    principalAmount: string;
    interestRate: string;
    minimumPayment: string;
    paymentDueDate: string;
  }>;
  strategy: 'avalanche' | 'snowball' | 'hybrid';
  monthlyBudget: number;
}

export default function PaymentSchedule({ loans, strategy, monthlyBudget }: PaymentScheduleProps) {
  const calculatePaymentSchedule = () => {
    const schedule: Payment[] = [];
    const currentDate = new Date();
    
    // Clone loans for calculations
    let remainingLoans = loans.map(loan => ({
      name: loan.debtName,
      balance: parseFloat(loan.principalAmount),
      rate: parseFloat(loan.interestRate) / 100 / 12, // Monthly interest rate
      minimumPayment: parseFloat(loan.minimumPayment),
      dueDate: parseInt(loan.paymentDueDate)
    }));

    // Calculate total minimum payments
    const totalMinPayment = remainingLoans.reduce((sum, loan) => sum + loan.minimumPayment, 0);
    const extraPayment = Math.max(0, monthlyBudget - totalMinPayment);

    // Generate 12 months of payments
    for (let month = 0; month < 12; month++) {
      // Sort loans based on strategy
      remainingLoans.sort((a, b) => {
        switch (strategy) {
          case 'avalanche':
            return b.rate - a.rate;
          case 'snowball':
            return a.balance - b.balance;
          case 'hybrid':
            return (b.rate * b.balance) - (a.rate * a.balance);
          default:
            return 0;
        }
      });

      // Calculate payments for each loan
      remainingLoans.forEach((loan, index) => {
        if (loan.balance <= 0) return;

        const paymentDate = new Date(currentDate);
        paymentDate.setMonth(paymentDate.getMonth() + month);
        paymentDate.setDate(loan.dueDate);

        const interest = loan.balance * loan.rate;
        let payment = loan.minimumPayment;

        // Add extra payment to first loan based on strategy
        if (index === 0) {
          payment += extraPayment;
        }

        // Ensure we don't overpay
        payment = Math.min(payment, loan.balance + interest);

        const principalPayment = payment - interest;
        loan.balance -= principalPayment;

        schedule.push({
          date: paymentDate,
          loanName: loan.name,
          amount: payment,
          principalPayment,
          interestPayment: interest,
          remainingBalance: loan.balance
        });
      });
    }

    return schedule;
  };

  const schedule = calculatePaymentSchedule();

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-white mb-4">Recommended Payment Schedule</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 border-b border-white/10">
              <th className="py-2 px-4 text-left">Due Date</th>
              <th className="py-2 px-4 text-left">Loan</th>
              <th className="py-2 px-4 text-right">Payment</th>
              <th className="py-2 px-4 text-right">Principal</th>
              <th className="py-2 px-4 text-right">Interest</th>
              <th className="py-2 px-4 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((payment, index) => (
              <tr 
                key={index}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-2 px-4 text-white">
                  {format(payment.date, 'MMM d, yyyy')}
                </td>
                <td className="py-2 px-4 text-white">{payment.loanName}</td>
                <td className="py-2 px-4 text-right text-green-400">
                  ₹{payment.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="py-2 px-4 text-right text-blue-400">
                  ₹{payment.principalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="py-2 px-4 text-right text-red-400">
                  ₹{payment.interestPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="py-2 px-4 text-right text-gray-400">
                  ₹{payment.remainingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 