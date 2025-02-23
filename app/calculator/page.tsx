'use client';
import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar/Navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

interface LoanForm {
  debtName: string;
  principalAmount: string;
  interestRate: string;
  loanDuration: string;
  minimumPayment: string;
  loanType: string;
  paymentDueDate: string;
  id?: string;
}

export default function CalculatorPage() {
  // Update initial user details with sample data
  const [userDetails, setUserDetails] = useState<UserDetails>({
    fullName: 'John Doe',
    occupation: 'Software Engineer',
    monthlySalary: '150000',
    companyName: 'Tech Corp',
    workExperience: '5',
    numberOfLoans: '2', // Set to 2 loans for testing
    aadharNumber: '123456789012',
    panNumber: 'ABCDE1234F'
  });

  // Update initial loan forms with sample data
  const [loanForms, setLoanForms] = useState<LoanForm[]>([
    {
      debtName: 'Personal Loan',
      principalAmount: '50000',
      interestRate: '8.5',
      loanDuration: '12',
      minimumPayment: '5000',
      loanType: 'home',
      paymentDueDate: '5',
    },
    {
      debtName: 'Car Loan',
      principalAmount: '100000',
      interestRate: '10.5',
      loanDuration: '24',
      minimumPayment: '7000',
      loanType: 'car',
      paymentDueDate: '15',
    }
  ]);

  const titleRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    // Animations
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2 }
    )
    .fromTo(formRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1 },
      '-=0.8'
    );

    // Background orb animation
    gsap.to(orbRef.current, {
      y: 30,
      x: 20,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  }, []);

  // Update the validateForm function to check document numbers at user level
  const validateForm = (userDetails: UserDetails, loanForms: LoanForm[]) => {
    // Convert string values to numbers for comparison
    const salary = parseFloat(userDetails.monthlySalary);
    const experience = parseFloat(userDetails.workExperience);

    if (isNaN(salary) || salary <= 0) {
      alert('Monthly salary must be greater than 0');
      return false;
    }

    if (isNaN(experience) || experience < 0) {
      alert('Work experience cannot be negative');
      return false;
    }

    if (parseInt(userDetails.numberOfLoans) < 1 || parseInt(userDetails.numberOfLoans) > 10) {
      alert('Number of loans must be between 1 and 10');
      return false;
    }

    // Validate Aadhar Number (12 digits)
    if (!/^\d{12}$/.test(userDetails.aadharNumber)) {
      alert('Please enter a valid 12-digit Aadhar number');
      return false;
    }

    // Validate PAN Number (ABCDE1234F format)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(userDetails.panNumber)) {
      alert('Please enter a valid PAN number in format ABCDE1234F');
      return false;
    }

    // Validate each loan form
    for (let i = 0; i < loanForms.length; i++) {
      const loan = loanForms[i];
      const principal = parseFloat(loan.principalAmount);
      const interest = parseFloat(loan.interestRate);
      const duration = parseFloat(loan.loanDuration);
      const minPayment = parseFloat(loan.minimumPayment);

      if (!loan.debtName.trim()) {
        alert(`Loan ${i + 1}: Debt name is required`);
        return false;
      }

      if (isNaN(principal) || principal <= 0) {
        alert(`Loan ${i + 1}: Principal amount must be greater than 0`);
        return false;
      }

      if (isNaN(interest) || interest <= 0 || interest > 100) {
        alert(`Loan ${i + 1}: Interest rate must be between 0 and 100`);
        return false;
      }

      if (isNaN(duration) || duration <= 0) {
        alert(`Loan ${i + 1}: Loan duration must be greater than 0`);
        return false;
      }

      if (isNaN(minPayment) || minPayment <= 0) {
        alert(`Loan ${i + 1}: Minimum payment must be greater than 0`);
        return false;
      }

      // Validate payment due date
      const dueDate = parseInt(loan.paymentDueDate);
      if (isNaN(dueDate) || dueDate < 1 || dueDate > 31) {
        alert(`Loan ${i + 1}: Please enter a valid payment due date (1-31)`);
        return false;
      }
    }

    return true;
  };

  // Update the handleUserDetailsChange function for better document number validation
  const handleUserDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate number of loans
    if (name === 'numberOfLoans') {
      const numLoans = parseInt(value);
      if (numLoans < 1) {
        alert('Number of loans must be at least 1');
        return;
      }
      if (numLoans > 10) {
        alert('Maximum 10 loans allowed');
        return;
      }
    }

    // Validate monthly salary
    if (name === 'monthlySalary' && parseFloat(value) < 0) {
      alert('Salary cannot be negative');
      return;
    }

    // Validate work experience
    if (name === 'workExperience' && parseFloat(value) < 0) {
      alert('Work experience cannot be negative');
      return;
    }

    // Validate Aadhar number as user types
    if (name === 'aadharNumber') {
      if (!/^\d*$/.test(value)) {
        alert('Aadhar number must contain only digits');
        return;
      }
      if (value.length > 12) {
        return; // Don't allow more than 12 digits
      }
    }

    // Validate PAN number as user types
    if (name === 'panNumber') {
      const upperValue = value.toUpperCase();
      if (upperValue.length <= 10 && !/^[A-Z]{0,5}[0-9]{0,4}[A-Z]?$/.test(upperValue)) {
        alert('Invalid PAN number format');
        return;
      }
      if (upperValue.length > 10) {
        return; // Don't allow more than 10 characters
      }
    }

    setUserDetails(prev => ({
      ...prev,
      [name]: name === 'panNumber' ? value.toUpperCase() : value
    }));

    // If number of loans changes, update loan forms
    if (name === 'numberOfLoans') {
      const newCount = parseInt(value) || 0;
      setLoanForms(prev => {
        const newForms = [...prev];
        if (newCount > prev.length) {
          // Add more forms
          for (let i = prev.length; i < newCount; i++) {
            newForms.push({
              debtName: '',
              principalAmount: '',
              interestRate: '',
              loanDuration: '',
              minimumPayment: '',
              loanType: 'personal',
              paymentDueDate: '',
            });
          }
        } else {
          // Remove excess forms
          return newForms.slice(0, newCount);
        }
        return newForms;
      });
    }
  };

  // Handle Loan Form Changes
  const handleLoanFormChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    // Validate numeric fields
    if (['principalAmount', 'minimumPayment'].includes(name) && numValue < 0) {
      alert('Amount cannot be negative');
      return;
    }

    if (name === 'interestRate' && (numValue < 0 || numValue > 100)) {
      alert('Interest rate must be between 0 and 100');
      return;
    }

    if (name === 'loanDuration' && numValue < 1) {
      alert('Loan duration must be at least 1 month');
      return;
    }

    // Validate Aadhar number format
    if (name === 'aadharNumber' && value.length === 12 && !/^\d+$/.test(value)) {
      alert('Aadhar number must contain only digits');
      return;
    }

    // Validate PAN number format
    if (name === 'panNumber' && value.length === 10 && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
      alert('Invalid PAN number format');
      return;
    }

    setLoanForms(prev => {
      const newForms = [...prev];
      newForms[index] = {
        ...newForms[index],
        [name]: value
      };
      return newForms;
    });
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm(userDetails, loanForms)) {
      return;
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDetails,
          loans: loanForms
        })
      });

      if (!response.ok) {
        throw new Error('Failed to calculate');
      }

      const result = await response.json();
      
      // Redirect to dashboard with the calculation ID
      router.push(`/dashboard?id=${result.calculationId}`);
    } catch (error) {
      alert('Failed to calculate repayment plans. Please try again.');
      console.error('Calculation error:', error);
    }
  };

  const deleteLoan = (loanId: string) => {
    setLoanForms(prevLoans => prevLoans.filter(loan => loan.id || ''));
  };

  return (
    <div className="min-h-screen bg-[#0A0118] overflow-hidden">
      <Navbar />
      
      {/* Background Elements */}
      <div className="fixed inset-0 opacity-30">
        <div ref={orbRef} className="absolute top-20 right-[10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-gradient-to-br from-purple-600 to-blue-600 blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-40 left-[5%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 blur-[60px] md:blur-[100px]" />
      </div>

      <main className="container mx-auto px-4 pt-32 pb-16 relative">
        <div className="max-w-2xl mx-auto">
          {/* Title Section */}
          <div ref={titleRef} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Debt Calculator
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Let's start with your details
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* User Details Section */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8">
              <h2 className="text-xl font-semibold text-white mb-6">Personal Details</h2>
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={userDetails.fullName}
                    onChange={handleUserDetailsChange}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    required
                  />
                </div>

                {/* Occupation & Salary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={userDetails.occupation}
                      onChange={handleUserDetailsChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Monthly Salary</label>
                    <input
                      type="number"
                      name="monthlySalary"
                      value={userDetails.monthlySalary}
                      onChange={handleUserDetailsChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                      placeholder="₹"
                      required
                    />
                  </div>
                </div>

                {/* Company & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={userDetails.companyName}
                      onChange={handleUserDetailsChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Work Experience (years)</label>
                    <input
                      type="number"
                      name="workExperience"
                      value={userDetails.workExperience}
                      onChange={handleUserDetailsChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                      required
                    />
                  </div>
                </div>

                {/* Number of Loans */}
                <div>
                  <label className="block text-gray-300 mb-2">Number of Loans</label>
                  <input
                    type="number"
                    name="numberOfLoans"
                    value={userDetails.numberOfLoans}
                    onChange={handleUserDetailsChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    required
                  />
                </div>

                {/* Document Numbers Section */}
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="block text-gray-300 mb-2">Aadhar Number</label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={userDetails.aadharNumber}
                      onChange={handleUserDetailsChange}
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength={12}
                      pattern="\d{12}"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">Format: 123456789012</p>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">PAN Number</label>
                    <input
                      type="text"
                      name="panNumber"
                      value={userDetails.panNumber}
                      onChange={handleUserDetailsChange}
                      placeholder="Enter 10-digit PAN number"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white uppercase focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">Format: ABCDE1234F</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Loan Forms */}
            {loanForms.map((loan, index) => (
              <div key={index} className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8">
                <h2 className="text-xl font-semibold text-white mb-6">Loan {index + 1}</h2>
                <div className="space-y-6">
                  {/* Debt Name */}
                  <div>
                    <label className="block text-gray-300 mb-2">Debt Name</label>
                    <input
                      type="text"
                      name="debtName"
                      value={loan.debtName}
                      onChange={(e) => handleLoanFormChange(index, e)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                      placeholder="e.g., Home Loan"
                    />
                  </div>

                  {/* Principal Amount & Interest Rate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Principal Amount</label>
                      <input
                        type="number"
                        name="principalAmount"
                        value={loan.principalAmount}
                        onChange={(e) => handleLoanFormChange(index, e)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                        placeholder="₹"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Interest Rate (%)</label>
                      <input
                        type="number"
                        name="interestRate"
                        value={loan.interestRate}
                        onChange={(e) => handleLoanFormChange(index, e)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                        placeholder="%"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Loan Duration & Minimum Payment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Loan Duration (months)</label>
                      <input
                        type="number"
                        name="loanDuration"
                        value={loan.loanDuration}
                        onChange={(e) => handleLoanFormChange(index, e)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                        placeholder="Months"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Minimum Payment</label>
                      <input
                        type="number"
                        name="minimumPayment"
                        value={loan.minimumPayment}
                        onChange={(e) => handleLoanFormChange(index, e)}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                        placeholder="₹"
                      />
                    </div>
                  </div>

                  {/* Loan Type */}
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Loan Type</label>
                    <select
                      name="loanType"
                      value={loan.loanType}
                      onChange={(e) => handleLoanFormChange(index, e)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.08] border border-white/20 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    >
                      <option value="personal" className="bg-[#1a1a2e]">Personal Loan</option>
                      <option value="home" className="bg-[#1a1a2e]">Home Loan</option>
                      <option value="car" className="bg-[#1a1a2e]">Car Loan</option>
                      <option value="education" className="bg-[#1a1a2e]">Education Loan</option>
                      <option value="credit-card" className="bg-[#1a1a2e]">Credit Card</option>
                      <option value="other" className="bg-[#1a1a2e]">Other</option>
                    </select>
                  </div>

                  {/* Payment Due Date */}
                  <div className="mt-6">
                    <label className="block text-gray-300 mb-2">Payment Due Date</label>
                    <input
                      type="number"
                      name="paymentDueDate"
                      value={loan.paymentDueDate}
                      onChange={(e) => handleLoanFormChange(index, e)}
                      min="1"
                      max="31"
                      placeholder="Day of month (1-31)"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter the day of month when payment is due</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              Calculate Repayment Plan
            </button>
          </form>

          {/* Loans List */}
          {loanForms.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Your Loans</h2>
              <div className="grid gap-6">
                {loanForms.map((loan, index) => (
                  <div 
                    key={index}
                    className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
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
                      <button
                        onClick={() => loan.id && deleteLoan(loan.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
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

              {/* Total Section */}
              <div className="mt-8 bg-white/[0.05] backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Total Debt</p>
                    <p className="text-2xl font-bold text-white">
                      ₹{loanForms.reduce((sum, loan) => sum + Number(loan.principalAmount), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Number of Loans</p>
                    <p className="text-2xl font-bold text-white">{loanForms.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}