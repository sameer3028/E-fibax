/**
 * Fibax Ayurveda — Customer Mobile Duplicate Audit CLI Script
 *
 * Runs an exhaustive, read-only audit across all customer accounts in the
 * active storage driver (JSON files or MySQL / PostgreSQL).
 *
 * Usage:
 *   node server/scripts/audit_duplicate_customers.js
 *
 * Safety Guarantee:
 *   - 100% READ-ONLY. Never modifies, updates, merges, or deletes any accounts or orders.
 */

import { initStore, getArray, closeStore, storageDriver } from '../store.js';
import { auditDuplicateCustomers } from '../services/userService.js';

async function main() {
  console.log('🔍 Initializing Fibax Storage Layer for Customer Audit...');
  await initStore();

  const driver = storageDriver();
  console.log(`🗄️  Active Storage Driver: ${driver}`);

  const users = getArray('users');
  const orders = getArray('orders');

  console.log(`📊 Total Registered Customer Accounts: ${users.length}`);
  console.log(`📦 Total Production Orders:            ${orders.length}`);

  const report = auditDuplicateCustomers(users, orders);

  console.log('\n=============================================================');
  console.log('📋 CUSTOMER MOBILE NUMBER AUDIT REPORT');
  console.log('=============================================================');
  console.log(`Timestamp:                  ${report.timestamp}`);
  console.log(`Total Customer Accounts:    ${report.totalUsers}`);
  console.log(`Unique Mobile Numbers:      ${report.uniquePhoneNumbers}`);
  console.log(`Duplicate Mobile Groups:    ${report.duplicateGroupsCount}`);
  console.log(`Total Affected Accounts:    ${report.totalAffectedAccounts}`);
  console.log(`Unparseable Mobile Numbers: ${report.unparseablePhonesCount}`);
  console.log('=============================================================\n');

  if (report.duplicateGroupsCount === 0) {
    console.log('✅ No duplicate mobile numbers found! All customer accounts have unique mobile numbers.');
  } else {
    console.log(`⚠️  Found ${report.duplicateGroupsCount} group(s) of accounts sharing the same mobile number:\n`);

    report.duplicateGroups.forEach((group, idx) => {
      console.log(`-------------------------------------------------------------`);
      console.log(`Group #${idx + 1}: Normalized Mobile: +91 ${group.normalizedPhone} (${group.duplicateCount} accounts)`);
      console.log(`-------------------------------------------------------------`);
      group.accounts.forEach((acc, aIdx) => {
        console.log(`  [Account #${aIdx + 1}]`);
        console.log(`    Account ID:   ${acc.id}`);
        console.log(`    Customer:     ${acc.name}`);
        console.log(`    Email:        ${acc.email}`);
        console.log(`    Stored Phone: ${acc.rawPhone}`);
        console.log(`    Created At:   ${acc.createdAt || 'N/A'}`);
        console.log(`    Total Logins: ${acc.loginCount}`);
        console.log(`    Orders Count: ${acc.orderCount} ${acc.orderIds.length ? `(${acc.orderIds.join(', ')})` : ''}`);
      });
      console.log('');
    });
  }

  if (report.unparseablePhonesCount > 0) {
    console.log('\n⚠️  Accounts with unparseable/invalid phone numbers:');
    report.unparseablePhones.forEach(u => {
      console.log(`  - [${u.id}] ${u.name} (${u.email}): "${u.rawPhone}"`);
    });
  }

  console.log('\n🛡️  Safety Notice: Zero customer accounts or orders were modified or deleted.');

  await closeStore();
  process.exit(0);
}

main().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
