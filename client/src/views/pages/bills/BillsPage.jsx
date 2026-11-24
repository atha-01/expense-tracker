/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { useExpense } from '../../../controllers/ExpenseContext';
import {
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  BoltIcon,
  FilmIcon,
  HomeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import styles from './BillsPage.module.css';

const statusFilterOptions = [
  { id: 'all',     label: 'All Bills' },
  { id: 'unpaid',  label: 'Unpaid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'paid',    label: 'Paid' },
];

export default function BillsPage() {
  const {
    bills,
    accounts,
    transactions,
    addBill,
    deleteBill,
    updateBillStatus,
    addTransaction,
    deleteTransaction,
  } = useExpense();

  // --------------------------------------------------------------------------
  // Filters & Sorting State
  // --------------------------------------------------------------------------
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [dateSortOrder, setDateSortOrder] = useState('asc');
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --------------------------------------------------------------------------
  // Add Bill Modal State
  // --------------------------------------------------------------------------
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState('monthly');
  const [error, setError] = useState('');

  // --------------------------------------------------------------------------
  // Confirm Payment Modal State
  // --------------------------------------------------------------------------
  const [payingBill, setPayingBill] = useState(null);
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [deductFromAccount, setDeductFromAccount] = useState(true);
  const [paymentError, setPaymentError] = useState('');

  // --------------------------------------------------------------------------
  // Delete Bill & Targeted Refund Modal State
  // --------------------------------------------------------------------------
  const [deletingBill, setDeletingBill] = useState(null);
  const [selectedTxIds, setSelectedTxIds] = useState([]);

  const todayString = new Date().toISOString().split('T')[0];

  // Live account balance floored at 0
  // Live account balance floored at 0 (Strict matching)
  function getAccountBalance(account) {
    let balance = Number(account.openingBalance) || 0;
    if (!transactions) return Math.max(0, balance);
    for (let i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      if (t.account === account.id || t.account === account.name) {
        if (t.type === 'income') balance += Number(t.amount) || 0;
        else if (t.type === 'expense') balance -= Number(t.amount) || 0;
      }
    }
    return Math.max(0, balance);
  }

  function getBalanceForAccountName(accName) {
    if (!accounts || accounts.length === 0) return 0;
    const found = accounts.find((a) => a.name === accName || a.id === accName);
    return found ? getAccountBalance(found) : 0;
  }

  // Calculate difference in calendar months relative to today
  function getMonthsDifference(dueDateStr) {
    if (!dueDateStr) return 0;
    const today = new Date();
    const billDate = new Date(dueDateStr);
    return (billDate.getFullYear() - today.getFullYear()) * 12 + 
           (billDate.getMonth() - today.getMonth());
  }

  // Next cycle due date
  function getNextDueDate(dateString, repeatFreq) {
    if (!dateString) return dateString;
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    let year = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let day = parseInt(parts[2], 10);

    if (repeatFreq === 'monthly') {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    } else if (repeatFreq === 'yearly') {
      year += 1;
    } else {
      return dateString;
    }

    const maxDays = new Date(year, month, 0).getDate();
    if (day > maxDays) day = maxDays;

    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  function getDisplayStatus(bill) {
    if (bill.status === 'paid') return 'paid';
    if (bill.dueDate && bill.dueDate < todayString) return 'overdue';
    return 'unpaid';
  }

  // Top stats
  let totalDue = 0;
  let overdueCount = 0;
  let unpaidCount = 0;
  let paidCount = 0;

  for (let i = 0; i < bills.length; i++) {
    const status = getDisplayStatus(bills[i]);
    if (status === 'paid') {
      paidCount++;
    } else {
      totalDue += Number(bills[i].amount) || 0;
      if (status === 'overdue') overdueCount++;
      else unpaidCount++;
    }
  }

  // Filter bills
  const filteredBills = bills.filter((bill) => {
    if (statusFilter === 'all') return true;
    return getDisplayStatus(bill) === statusFilter;
  });

  // Sort bills
  filteredBills.sort((a, b) => {
    const timeA = new Date(a.dueDate || 0).getTime();
    const timeB = new Date(b.dueDate || 0).getTime();
    return dateSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  function toggleDateSort() {
    setDateSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  // Add Bill
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !amount || !dueDate) {
      setError('Please provide bill name, amount, and due date.');
      return;
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than ₹0.');
      return;
    }

    await addBill({
      name: name.trim(),
      amount: Number(amount),
      dueDate: dueDate,
      repeat: repeat,
      status: 'unpaid',
    });

    setName('');
    setAmount('');
    setDueDate('');
    setRepeat('monthly');
    setShowModal(false);
  }

  // Open Payment modal
  function handleOpenPayModal(bill) {
    const diff = getMonthsDifference(bill.dueDate);
    if (diff > 1) {
      alert('You can only pay up to 1 month in advance.');
      return;
    }

    setPaymentError('');
    setPayingBill(bill);
    setPaymentDate(todayString);
    setDeductFromAccount(true);
    if (accounts && accounts.length > 0) {
      setPaymentAccount(accounts[0].name);
    } else {
      setPaymentAccount('Cash');
    }
  }

  // Advance to next cycle (max 1 month ahead)
  async function handleAdvanceCycle(bill) {
    const diff = getMonthsDifference(bill.dueDate);
    if (diff >= 1) {
      alert('Advance limit reached: You can only schedule up to 1 month in advance.');
      return;
    }

    const nextDate = getNextDueDate(bill.dueDate, bill.repeat || 'monthly');
    await updateBillStatus(bill.id || bill._id, 'unpaid', nextDate);
  }

  // Confirm payment
  async function handleConfirmPayment(e) {
    e.preventDefault();
    if (!payingBill) return;

    setPaymentError('');
    const billId = payingBill.id || payingBill._id;
    const billAmount = Number(payingBill.amount) || 0;
    const availableBal = getBalanceForAccountName(paymentAccount);

    const diff = getMonthsDifference(payingBill.dueDate);
    if (diff > 1) {
      setPaymentError('Payment limit reached: You can only pay up to 1 month in advance.');
      return;
    }

    if (deductFromAccount) {
      if (billAmount > availableBal) {
        setPaymentError(
          `Insufficient funds in ${paymentAccount}. Available: ₹${availableBal.toLocaleString()}, Required: ₹${billAmount.toLocaleString()}. Please select another account.`
        );
        return;
      }

      await addTransaction({
        type: 'expense',
        amount: billAmount,
        category: 'Bills',
        account: paymentAccount,
        date: paymentDate || todayString,
        note: `Paid ${payingBill.name} (${payingBill.repeat || 'bill'})`,
        icon: 'bolt',
      });
    }

    await updateBillStatus(billId, 'paid');
    setPayingBill(null);
  }

  // Helper: Open Delete Modal and classify transactions
  function handleOpenDeleteModal(bill) {
    setDeletingBill(bill);
    if (!transactions) {
      setSelectedTxIds([]);
      return;
    }

    const nameLower = (bill.name || '').trim().toLowerCase();
    const related = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const note = (t.note || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      return note.includes(nameLower) || (cat === 'bills' && note.includes(nameLower));
    });

    // Only allow selecting this month and next month (offset >= 0)
    const eligible = related.filter((t) => getMonthsDifference(t.date) >= 0);
    setSelectedTxIds(eligible.map((t) => t.id || t._id));
  }

  // Confirm Delete & Refund selected transactions
  async function handleConfirmDelete() {
    if (!deletingBill) return;
    const billId = deletingBill.id || deletingBill._id;

    // Delete selected refund transactions
    for (let i = 0; i < selectedTxIds.length; i++) {
      await deleteTransaction(selectedTxIds[i]);
    }

    // Delete the bill
    await deleteBill(billId);
    setDeletingBill(null);
  }

  function renderBillIcon(billName) {
    const n = (billName || '').toLowerCase();
    let IconComp = DocumentTextIcon;
    if (n.includes('netflix') || n.includes('spotify') || n.includes('prime') || n.includes('disney')) {
      IconComp = FilmIcon;
    } else if (n.includes('electric') || n.includes('power') || n.includes('wifi') || n.includes('broadband')) {
      IconComp = BoltIcon;
    } else if (n.includes('rent') || n.includes('maintenance')) {
      IconComp = HomeIcon;
    }
    return <IconComp className={styles.billIconSvg} />;
  }

  const modalAccountBal = getBalanceForAccountName(paymentAccount);
  const isInsufficient = deductFromAccount && Number(payingBill?.amount || 0) > modalAccountBal;

  // Filter transactions for deleting modal
  let eligibleDeleteTxs = [];
  let protectedDeleteTxs = [];
  if (deletingBill && transactions) {
    const nameLower = (deletingBill.name || '').trim().toLowerCase();
    const related = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const note = (t.note || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      return note.includes(nameLower) || (cat === 'bills' && note.includes(nameLower));
    });
    eligibleDeleteTxs = related.filter((t) => getMonthsDifference(t.date) >= 0);
    protectedDeleteTxs = related.filter((t) => getMonthsDifference(t.date) < 0);
  }

  const selectedRefundTotal = eligibleDeleteTxs
    .filter((t) => selectedTxIds.includes(t.id || t._id))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className={styles.page}>

      {/* Header Row: Title, Quick Stats, & Add Bill Button */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Bills & Subscriptions</h1>
          <p className={styles.pageSub}>
            Total Due: <strong>₹{totalDue.toLocaleString()}</strong> across {unpaidCount + overdueCount} bills
            {overdueCount > 0 && <span className={styles.overdueAlert}> · {overdueCount} Overdue</span>}
          </p>
        </div>

        <button type="button" className={styles.addBillPillBtn} onClick={() => setShowModal(true)}>
          <PlusIcon className={styles.plusSvg} />
          <span>Add Bill</span>
        </button>
      </div>

      {/* Main Bills Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRowTh}>
                
                {/* Column 1: Bill Name */}
                <th className={styles.thName}>Bill & Service</th>

                {/* Column 2: Due Date with Sort Toggle */}
                <th className={styles.thDate}>
                  <button type="button" className={styles.sortableHeaderBtn} onClick={toggleDateSort}>
                    <span>Due Date</span>
                    {dateSortOrder === 'asc' ? (
                      <ArrowUpIcon className={styles.sortSvg} />
                    ) : (
                      <ArrowDownIcon className={styles.sortSvg} />
                    )}
                  </button>
                </th>

                {/* Column 3: Status with Filter Dropdown */}
                <th className={styles.thStatus}>
                  <div className={styles.filterWrapper} ref={filterRef}>
                    <button
                      type="button"
                      className={styles.filterTrigger}
                      onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                    >
                      <span>
                        Status:{' '}
                        <strong>
                          {statusFilterOptions.find((o) => o.id === statusFilter)?.label}
                        </strong>
                      </span>
                      <ChevronDownIcon
                        className={`${styles.chevron} ${isStatusMenuOpen ? styles.chevronOpen : ''}`}
                      />
                    </button>

                    {isStatusMenuOpen && (
                      <div className={styles.filterMenu}>
                        {statusFilterOptions.map((opt) => (
                          <div
                            key={opt.id}
                            className={`${styles.filterItem} ${
                              statusFilter === opt.id ? styles.filterActive : ''
                            }`}
                            onClick={() => {
                              setStatusFilter(opt.id);
                              setIsStatusMenuOpen(false);
                            }}
                          >
                            <span>{opt.label}</span>
                            {statusFilter === opt.id && <CheckIcon className={styles.checkSvg} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </th>

                {/* Column 4: Amount */}
                <th className={styles.thAmount}>Amount</th>

                {/* Column 5: Actions */}
                <th className={styles.thActions}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyTd}>
                    No bills found {statusFilter !== 'all' ? `for "${statusFilter}"` : ''}.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => {
                  const displayStatus = getDisplayStatus(bill);
                  const isPaid = displayStatus === 'paid';
                  const isOverdue = displayStatus === 'overdue';
                  const monthsAhead = getMonthsDifference(bill.dueDate);
                  
                  const canAdvance = isPaid && bill.repeat && bill.repeat !== 'once' && monthsAhead <= 0;
                  const isMaxAdvanceReached = isPaid && bill.repeat && bill.repeat !== 'once' && monthsAhead >= 1;
                  const isTooFarAheadToPay = !isPaid && monthsAhead > 1;

                  return (
                    <tr key={bill.id || bill._id} className={styles.tableRow}>
                      
                      {/* Name & Frequency */}
                      <td className={styles.tdName}>
                        <div className={styles.billCell}>
                          <div className={styles.billIconBadge}>
                            {renderBillIcon(bill.name)}
                          </div>
                          <div>
                            <p className={styles.billTitle}>{bill.name}</p>
                            <span className={styles.repeatBadge}>
                              {bill.repeat ? bill.repeat.toUpperCase() : 'MONTHLY'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className={styles.tdDate}>
                        <div className={styles.dateCell}>
                          <CalendarDaysIcon className={styles.dateSvg} />
                          <span className={styles.dateText}>{bill.dueDate || '—'}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className={styles.tdStatus}>
                        {isPaid && (
                          <span className={`${styles.statusBadge} ${styles.badgePaid}`}>
                            <CheckCircleIcon className={styles.badgeSvg} />
                            Paid
                          </span>
                        )}
                        {isOverdue && (
                          <span className={`${styles.statusBadge} ${styles.badgeOverdue}`}>
                            <ExclamationCircleIcon className={styles.badgeSvg} />
                            Overdue
                          </span>
                        )}
                        {!isPaid && !isOverdue && (
                          <span className={`${styles.statusBadge} ${styles.badgeUnpaid}`}>
                            <ClockIcon className={styles.badgeSvg} />
                            Upcoming
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className={styles.tdAmount}>
                        <span className={styles.amountText}>
                          ₹{Number(bill.amount).toLocaleString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className={styles.tdActions}>
                        <div className={styles.actionGroup}>
                          {isPaid ? (
                            <>
                              {/* 1. Unresponsive, static badge for Paid bills */}
                              <div className={styles.paidBadgePill}>
                                <CheckIcon className={styles.checkSvg} />
                                <span>Paid</span>
                              </div>
                              
                              {canAdvance && (
                                <button
                                  type="button"
                                  className={styles.nextCycleBtn}
                                  onClick={() => handleAdvanceCycle(bill)}
                                  title={`Advance to next cycle (${getNextDueDate(bill.dueDate, bill.repeat)})`}
                                >
                                  <span>Next Cycle →</span>
                                </button>
                              )}

                              {isMaxAdvanceReached && (
                                <span
                                  className={styles.advanceLimitBadge}
                                  title="Already paid 1 month in advance. Next cycle unlocks next month."
                                >
                                  1 Mo Ahead ✓
                                </span>
                              )}
                            </>
                          ) : (
                            isTooFarAheadToPay ? (
                              <button
                                type="button"
                                className={styles.disabledPaidBtn}
                                disabled
                                title="You can only pay up to 1 month in advance."
                              >
                                Ahead (&gt;1 mo)
                              </button>
                            ) : (
                              <button
                                type="button"
                                className={styles.togglePaidBtn}
                                onClick={() => handleOpenPayModal(bill)}
                              >
                                Mark Paid
                              </button>
                            )
                          )}
                          
                          {/* Opens Delete & Refund Modal */}
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleOpenDeleteModal(bill)}
                            title="Delete Bill"
                          >
                            <TrashIcon className={styles.trashSvg} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Bill */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Add New Bill</h3>
                <p className={styles.modalSub}>Track subscriptions, utilities, and recurring dues</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Bill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix, Electricity, Rent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 649"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Frequency</label>
                <select
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  className={styles.formSelect}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="once">One Time</option>
                </select>
              </div>

              {error && <p className={styles.formError}>{error}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Payment */}
      {payingBill && (
        <div className={styles.modalOverlay} onClick={() => setPayingBill(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>Confirm Bill Payment</h3>
                <p className={styles.modalSub}>Log payment and update your account balance</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPayingBill(null)}
              >
                <XMarkIcon className={styles.closeIcon} />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className={styles.modalForm}>
              <div className={styles.paySummaryCard}>
                <div className={styles.paySummaryInfo}>
                  <span className={styles.payBillName}>{payingBill.name}</span>
                  <span className={styles.payDueDate}>Due: {payingBill.dueDate}</span>
                </div>
                <span className={styles.payAmountBadge}>
                  ₹{Number(payingBill.amount).toLocaleString()}
                </span>
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={deductFromAccount}
                  onChange={(e) => setDeductFromAccount(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span>Deduct from account & record in Recent Activity</span>
              </label>

              {deductFromAccount && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Paid From Account</label>
                    <select
                      value={paymentAccount}
                      onChange={(e) => {
                        setPaymentAccount(e.target.value);
                        setPaymentError('');
                      }}
                      className={styles.formSelect}
                      required
                    >
                      {accounts && accounts.length > 0 ? (
                        accounts.map((acc) => {
                          const bal = getAccountBalance(acc);
                          return (
                            <option key={acc.id || acc._id} value={acc.name}>
                              {acc.name} (Available: ₹{bal.toLocaleString()})
                            </option>
                          );
                        })
                      ) : (
                        <>
                          <option value="Bank Account">Bank Account</option>
                          <option value="Cash">Cash</option>
                          <option value="UPI">UPI</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Payment Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className={styles.formInput}
                      required
                    />
                  </div>
                </>
              )}

              {isInsufficient && (
                <div className={styles.insufficientAlert}>
                  <ExclamationCircleIcon className={styles.alertIcon} />
                  <span>
                    Insufficient balance in <strong>{paymentAccount}</strong> (₹{modalAccountBal.toLocaleString()}).
                  </span>
                </div>
              )}

              {paymentError && <p className={styles.formError}>{paymentError}</p>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setPayingBill(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isInsufficient}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* Modal: Delete Bill with Granular Refund Selection                    */}
      {/* ==================================================================== */}
      {deletingBill && (
        <div className={styles.modalOverlay} onClick={() => setDeletingBill(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.deleteModalHeader}>
              <div className={styles.deleteIconBadge}>
                <TrashIcon className={styles.deleteTrashSvg} />
              </div>
              <div>
                <h3 className={styles.modalTitle}>Delete "{deletingBill.name}"?</h3>
                <p className={styles.modalSub}>Select payments from this month/advance to refund.</p>
              </div>
            </div>

            {/* List of eligible payments from this month & advance cycle */}
            {eligibleDeleteTxs.length > 0 ? (
              <div className={styles.refundSection}>
                <p className={styles.refundSectionHeader}>
                  Choose payments to refund and remove from history:
                </p>

                <div className={styles.txRefundList}>
                  {eligibleDeleteTxs.map((tx) => {
                    const txId = tx.id || tx._id;
                    const isChecked = selectedTxIds.includes(txId);

                    return (
                      <label key={txId} className={styles.txRefundItem}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTxIds([...selectedTxIds, txId]);
                            } else {
                              setSelectedTxIds(selectedTxIds.filter((id) => id !== txId));
                            }
                          }}
                          className={styles.refundCheckbox}
                        />
                        <div className={styles.txRefundInfo}>
                          <span className={styles.txRefundNote}>{tx.note || deletingBill.name}</span>
                          <span className={styles.txRefundMeta}>
                            {tx.date} · Paid from {tx.account || 'Account'}
                          </span>
                        </div>
                        <span className={styles.txRefundAmount}>
                          ₹{Number(tx.amount).toLocaleString()}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className={styles.noRefundNotice}>
                No current or advance payments found for this bill. It will simply be removed from your list.
              </p>
            )}

            {/* Locked Previous Month Bills Notice */}
            {protectedDeleteTxs.length > 0 && (
              <div className={styles.protectedNotice}>
                <ShieldCheckIcon className={styles.protectedIcon} />
                <span>
                  {protectedDeleteTxs.length} past payment(s) from previous months are locked and will remain in your history.
                </span>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeletingBill(null)}
              >
                Keep Bill
              </button>
              <button
                type="button"
                className={styles.deleteDangerBtn}
                onClick={handleConfirmDelete}
              >
                {selectedRefundTotal > 0
                  ? `Delete & Refund ₹${selectedRefundTotal.toLocaleString()}`
                  : 'Delete Bill'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}