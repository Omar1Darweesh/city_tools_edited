# Backend Security & Bug Audit Report
**Date:** February 9, 2026  
**Auditor:** AI Code Review  
**Project:** City Tools POS System

---

## 🔴 CRITICAL ISSUES (Must Fix Immediately)

### 1. **Products API Completely Unprotected** ⚠️ SEVERE
**Location:** `backend/src/products/products.controller.ts:33`

```typescript
@Controller('products')
//@UseGuards(JwtAuthGuard)  // ❌ COMMENTED OUT!
export class ProductsController {
```

**Impact:** 
- Anyone can create, edit, delete products without authentication
- Can manipulate prices, costs, inventory
- Can steal all product data including cost information
- No audit trail for changes

**Fix:**
```typescript
@Controller('products')
@UseGuards(JwtAuthGuard)  // ✅ UNCOMMENT THIS
export class ProductsController {
```

**Estimated Risk:** **CRITICAL** - Financial loss, data theft, inventory manipulation

---

### 2. **Race Condition in Payment Processing** 🔴
**Location:** `backend/src/sales/sales.service.ts:247-320`

**Issue:** The `addPayment` method uses `FOR UPDATE` lock, but then reads `invoice.lines` outside the locked query, creating a time window where data could change.

**Current Code:**
```typescript
const invoices = await tx.$queryRaw<any[]>`
  SELECT * FROM "SalesInvoice" 
  WHERE id = ${salesInvoiceId}
  FOR UPDATE
`;

// ❌ Lines loaded AFTER the lock query
const lines = await tx.salesLine.findMany({
  where: { salesInvoiceId },
});
```

**Impact:**
- Concurrent payments could bypass full payment check
- Possible double-payment or overpayment
- Stock might be deducted twice

**Fix:** Load lines within the same query or ensure atomic transaction isolation.

---

### 3. **Potential Decimal Precision Loss**
**Location:** Multiple services (sales, reports, stock)

**Issue:** Converting `Prisma.Decimal` to `Number` throughout codebase:
```typescript
const totalRefunds = Number(salesAgg._sum.totalRefunded || 0);
const cost = Number(product.costAvg);
```

**Impact:** 
- Financial calculations lose precision beyond 15-17 digits
- Accumulation of rounding errors over thousands of transactions
- Could cause accounting discrepancies

**Fix:** Use a decimal library like `decimal.js` or keep calculations in `Prisma.Decimal` until final output.

---

## 🟠 HIGH PRIORITY ISSUES

### 4. **Missing Pagination Limits**
**Location:** `backend/src/stock/stock.service.ts:110`

**Issue:** Pagination has limits, but they are very high and could be exploited:
```typescript
const MAX_TAKE = 500;   // Still very high
const MAX_SKIP = 100000; // Allows skipping millions of records
```

**Impact:**
- Memory exhaustion attacks
- Slow database queries
- DOS potential

**Recommendation:** Reduce MAX_TAKE to 100, MAX_SKIP to 10000.

---

### 5. **Timezone Handling Issue in Reports**
**Location:** `backend/src/reports/reports.service.ts:270`

**Issue:** Hourly sales stats comments acknowledge timezone problem:
```typescript
// FIXME: Ideally shift to requested timezone. For now, using server local hour.
const h = d.getHours().toString().padStart(2, '0') + ':00';
```

**Impact:**
- Reports show wrong sales time for users in different timezones
- Business decisions based on incorrect data
- Compliance issues for multi-region operations

**Fix:** Accept timezone parameter from client or store timestamps with timezone info.

---

### 6. **SQL Injection Risk via Raw Queries**
**Location:** `backend/src/sales/sales.service.ts:251`

**Issue:** Using template literals in `$queryRaw`:
```typescript
const invoices = await tx.$queryRaw<any[]>`
  SELECT * FROM "SalesInvoice" 
  WHERE id = ${salesInvoiceId}
  FOR UPDATE
`;
```

**Current Status:** Parameterized correctly, but **future risk if developers copy this pattern**

**Recommendation:** Add code comment warning about SQL injection and prefer Prisma's type-safe methods when possible.

---

### 7. **Missing Unique Constraints**
**Location:** `backend/prisma/schema.prisma`

**Missing critical unique constraints:**
- `branches.code` - Should be unique (has `@unique`, ✅ OK)
- `customers.phone` - Has `@unique` but nullable, allows duplicate nulls
- `products.code` & `barcode` - Has `@unique` (✅ OK)

**Issue:** Multiple customers can have `NULL` phone, which might be unintended.

**Fix:** If phone is required for non-casual customers, add validation or use empty string instead of NULL.

---

## 🟡 MEDIUM PRIORITY ISSUES

### 8. **Incomplete Error Handling**
**Location:** Multiple controllers

**Issue:** Some query parameters aren't validated for type:
```typescript
@Query('threshold') threshold?: number  // ❌ String passed, not validated
```

**Impact:** 
- Type errors in service layer
- Unexpected NaN values
- Poor user error messages

**Fix:** Use `@Query('threshold', ParseIntPipe)` or validate in DTOs.

---

### 9. **Missing Cascade Delete Protection**
**Location:** `backend/prisma/schema.prisma`

**Issue:** Some relations use `onDelete: Cascade` which could delete critical data:
- Deleting a category cascades to all products
- Deleting a user cascades to all their created records

**Impact:** Accidental mass deletion

**Recommendation:** 
- Use soft deletes (set `active: false`)
- Add `onDelete: Restrict` for critical relations
- Require admin confirmation for cascading deletes

---

### 10. **Large Transaction Scope**
**Location:** `backend/src/sales/returns.service.ts:300-600`

**Issue:** The `createReturn` transaction is very long (300+ lines), increasing chance of:
- Deadlocks
- Long locks blocking other operations
- Timeout on slow databases

**Recommendation:** Break into smaller transactions or optimize queries.

---

### 11. **Hardcoded Business Logic**
**Location:** `backend/src/sales/sales.service.ts:132`

**Issue:** Profit calculation formula is hardcoded in service:
```typescript
const netProfit = revenue - totalCosts;
```

**Impact:** 
- Hard to modify formula
- No flexibility for different business models
- Testing requires mocking entire service

**Recommendation:** Extract to a configurable ProfitCalculator service.

---

### 12. **Missing Rate Limiting**
**Location:** All controllers

**Issue:** No rate limiting on any endpoints

**Impact:**
- Brute force attacks on login
- API abuse
- DOS attacks

**Fix:** Add `@nestjs/throttler` package and configure rate limits.

---

## 🟢 LOW PRIORITY / CODE QUALITY ISSUES

### 13. **Console.log in Production Code**
**Locations:** Throughout services (returns.service, sales.service)

**Issue:** Extensive debugging console.logs:
```typescript
console.log('💰 Profit Calculation:');
console.log('🔵 ===== RETURN PROCESS STARTED =====');
```

**Impact:** 
- Log spam in production
- Performance overhead
- Potentially logs sensitive data

**Fix:** Replace with proper logger (Winston, Pino) with log levels.

---

### 14. **Missing Indexes for Common Queries**
**Location:** `backend/prisma/schema.prisma`

**Missing indexes on:**
- `salesInvoices.paymentStatus` (often filtered)
- `salesInvoices.customerId` (often filtered)
- `salesInvoices.channel` (often filtered)
- `products.active` (often filtered)

**Impact:** Slow queries as data grows

**Fix:** Add these indexes:
```prisma
@@index([paymentStatus])
@@index([customerId])
@@index([channel])
```

---

### 15. **Inconsistent Naming Conventions**
**Location:** `backend/prisma/schema.prisma`

**Issue:** Some fields use snake_case mapping, others don't:
```prisma
createdAt   DateTime   @default(now()) @map("created_at")  // snake_case
branchId    Int        @map("branchid")  // no underscore
customerId  Int?       @map("customerid")  // no underscore
```

**Impact:** Confusion, hard to maintain

**Fix:** Standardize on snake_case for all database columns.

---

### 16. **Magic Numbers**
**Location:** Multiple files

**Issue:** Unexplained numbers throughout:
```typescript
const threshold = 10  // What does 10 mean?
endOfDay.setHours(23, 59, 59, 999);  // Why 999ms?
```

**Fix:** Extract to named constants.

---

### 17. **Duplicated Business Logic**
**Location:** Sales and returns services

**Issue:** Stock movement creation duplicated in multiple places:
- `sales.service.ts:220`
- `returns.service.ts:500`
- `stock.service.ts:80`

**Impact:** 
- Bugs in one place not fixed in others
- Inconsistent behavior
- Hard to maintain

**Fix:** Extract to shared `StockMovementService` with `createMovement()` method.

---

## 📊 POTENTIAL FUTURE ISSUES

### 18. **No Backup Strategy for Returns**
**Issue:** If a return transaction fails halfway, products might be:
- Added back to stock but not marked as returned in the invoice
- Marked as returned but stock not updated

**Recommendation:** Implement idempotency keys for returns.

---

### 19. **Missing Audit Trail**
**Issue:** Only products have audit trail. Critical operations lack auditing:
- Price changes
- Payment records
- Stock adjustments
- User permission changes

**Recommendation:** Implement comprehensive audit logging system.

---

### 20. **No Data Validation on Database Level**
**Issue:** Prisma schema has no `CHECK` constraints for:
- Negative quantities
- Negative prices
- Invalid date ranges (e.g., deliveryDate before createdAt)

**Impact:** Invalid data could bypass application validation

**Fix:** Add database-level constraints where possible.

---

## 🎯 RECOMMENDED IMMEDIATE ACTIONS

### Priority 1 (Fix Today):
1. ✅ Uncomment `@UseGuards(JwtAuthGuard)` in products controller
2. ✅ Add SQL injection warning comments
3. ✅ Review all race conditions in payment processing

### Priority 2 (Fix This Week):
4. Implement rate limiting
5. Replace console.log with proper logger
6. Add missing database indexes
7. Fix timezone handling in reports

### Priority 3 (Fix This Month):
8. Implement comprehensive audit logging
9. Add database-level constraints
10. Refactor duplicated stock movement logic
11. Extract business logic to configurable services

---

## 📈 METRICS

- **Total Issues Found:** 20
- **Critical:** 3
- **High:** 4
- **Medium:** 5
- **Low:** 5
- **Future Concerns:** 3

---

## ✅ POSITIVE FINDINGS

1. ✅ Most critical operations wrapped in transactions
2. ✅ DTO validation using class-validator
3. ✅ Proper use of Prisma relationships
4. ✅ Soft deletes implemented for most entities
5. ✅ Password hashing with bcrypt
6. ✅ JWT authentication properly implemented

---

## 📝 CONCLUSION

The codebase is **generally well-structured** but has **one critical security vulnerability** (unprotected products API) that must be fixed immediately. The financial calculation logic is sound, but could benefit from using a decimal library for precision. Most issues are code quality improvements that will help with long-term maintainability and scalability.

**Overall Security Rating:** ⚠️ **6/10** (would be 8/10 after fixing the products controller auth)

---

**Report Generated:** February 9, 2026  
**Next Audit Recommended:** After implementing Priority 1 & 2 fixes
