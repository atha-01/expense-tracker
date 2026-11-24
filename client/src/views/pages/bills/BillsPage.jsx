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
} from '@heroicons/react/24/outline';
import styles from './BillsPage.module.css';

const statusFilterOptions = [
  { id: 'all',     label: 'All Bills' },
  { id: 'unpaid',  label: 'Unpaid' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'paid',    label: 'Paid' },
];

export default function BillsPage() {
  const { bills, addBill, deleteBill, updateBillStatus } = useExpense();

  // --------------------------------------------------------------------------
  // Filters & Sorting State
  // --------------------------------------------------------------------------
  const [statusFilter, setStatusFilter] = useState('all');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [dateSortOrder, setDateSortOrder] = useState('asc'); // 'asc' (due soonest first) | 'desc'
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

  const todayString = new Date().toISOString().split('T')[0];

  function getDisplayStatus(bill) {
    if (bill.status === 'paid') return 'paid';
    if (bill.dueDate && bill.dueDate < todayString) return 'overdue';
    return 'unpaid';
  }

  // Calculate top-level stats
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

  // Sort bills by due date
  filteredBills.sort((a, b) => {
    const timeA = new Date(a.dueDate || 0).getTime();
    const timeB = new Date(b.dueDate || 0).getTime();
    return dateSortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  function toggleDateSort() {
    setDateSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }

  // --------------------------------------------------------------------------
  // Form Submission
  // --------------------------------------------------------------------------
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

  function handleTogglePaid(bill) {
    const newStatus = bill.status === 'paid' ? 'unpaid' : 'paid';
    updateBillStatus(bill.id || bill._id, newStatus);
  }

  async function handleDelete(id, billName) {
    if (window.confirm(`Are you sure you want to delete "${billName}"?`)) {
      await deleteBill(id);
    }
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
              <tr>
                {/* Column 1: Bill Name & Frequency */}
                <th className={styles.thName}>Bill & Repeat</th>

                {/* Column 2: Due Date (Sortable) */}
                <th className={styles.thDate}>
                  <button type="button" className={styles.sortableHeaderBtn} onClick={toggleDateSort}>
                    <span>Due Date</span>
                    {dateSortOrder === 'asc' ? (
                      <ArrowUpIcon className={styles.sortSvg} title="Due Soonest First" />
                    ) : (
                      <ArrowDownIcon className={styles.sortSvg} title="Furthest First" />
                    )}
                  </button>
                </th>

                {/* Column 3: Status with Dropdown Filter */}
                <th className={styles.thStatus}>
                  <div className={styles.filterWrapper} ref={filterRef}>
                    <button
                      type="button"
                      className={styles.filterTrigger}
                      onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
                    >
                      <span>
                        {statusFilter === 'all'
                          ? 'All Statuses'
                          : statusFilterOptions.find((opt) => opt.id === statusFilter)?.label}
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
                          <button
                            type="button"
                            className={`${styles.togglePaidBtn} ${isPaid ? styles.paidActive : ''}`}
                            onClick={() => handleTogglePaid(bill)}
                          >
                            {isPaid ? 'Paid' : 'Mark Paid'}
                          </button>
                          
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(bill.id || bill._id, bill.name)}
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

      {/* ==================================================================== */}
      {/* Translucent Frosted Glass Modal for Adding a Bill                    */}
      {/* ==================================================================== */}
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
              {/* Bill Name */}
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

              {/* Amount */}
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

              {/* Due Date */}
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

              {/* Frequency */}
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

    </div>
  );
}