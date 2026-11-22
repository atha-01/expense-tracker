/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import styles from './IconSelect.module.css';

export default function IconSelect({ options, value, onChange, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Find the currently selected option object
  const selectedOption = options.find(function(opt) {
    return opt.id === value;
  }) || options[0];

  const SelectedIcon = selectedOption ? selectedOption.Icon : null;

  // Close dropdown when clicking outside of it
  useEffect(function() {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleSelect(id) {
    onChange(id);
    setIsOpen(false);
  }

  return (
    <div className={styles.container} ref={dropdownRef}>
      {label && <label className={styles.label}>{label}</label>}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
        onClick={function() { setIsOpen(!isOpen); }}
      >
        <div className={styles.selectedContent}>
          {SelectedIcon && <SelectedIcon className={styles.selectedIcon} />}
          <span className={styles.selectedText}>{selectedOption ? selectedOption.label : 'Select...'}</span>
        </div>
        <ChevronDownIcon className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`} />
      </button>

      {/* Floating Menu with Icons */}
      {isOpen && (
        <div className={styles.menu}>
          {options.map(function(opt) {
            const OptIcon = opt.Icon;
            const isSelected = opt.id === value;

            return (
              <div
                key={opt.id}
                className={`${styles.menuItem} ${isSelected ? styles.itemActive : ''}`}
                onClick={function() { handleSelect(opt.id); }}
              >
                <div className={styles.itemContent}>
                  {OptIcon && <OptIcon className={styles.itemIcon} />}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <CheckIcon className={styles.checkIcon} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}