# Retail Planning & Analytics Dashboard - How to Use

## Overview
The Retail Planning & Analytics Dashboard is a comprehensive platform for managing retail planning, commercial operations, inventory tracking, and sales analysis. The application provides both week-level (52 weeks) and period-level (13 periods) data views with editable cells for planning purposes.

---

## OTB (Open to Buy) Planning Module

### Column Definitions

The OTB module displays 7 key columns:

1. **CP Sales (Cost Price Sales)** - Budget sales plan at cost price. This is a read-only reference value.

2. **Actual Sales** - Shows actual sales at cost price for closed periods. Displays "—" for future periods.

3. **LY Closing Stock (Last Year Closing Stock)** - Previous year's closing inventory at cost. This is a reference value used in OTB calculations.

4. **Tgt Closing Stock (Target Closing Stock)** - Your target inventory level for the period. 
   - **Editable for**: Periods after the current period (future periods)
   - **Locked for**: Current and closed periods
   - **Used in**: OTB automatic calculation

5. **Actual Closing Stock** - Shows the actual closing inventory for completed/closed periods. Displays "—" for future periods.

6. **OTB (Open to Buy)** - Automatically calculated purchase plan. 
   - **Calculation Logic:**
     - **Period 1 of year**: OTB = Target Closing Stock
     - **Other periods**: OTB = CP Sales + Target Closing Stock - LY Closing Stock
   - **Visual Indicator**: Turns RED if OTB is negative (invalid state)
   - **Read-only**: You cannot directly edit OTB; it updates automatically when you change Target Closing Stock

7. **Local Orders/Deliveries** - Sum of local orders and deliveries for the period.
   - **Read-only**: This field is a calculated sum and cannot be edited

### Data State Rules

- **Closed Periods** (before current): Display historical data (read-only)
- **Current Period**: Read-only; historical data displays
- **Future Periods**: Allow editing of Target Closing Stock to plan ahead; Actual values show "—"

### How to Make Edits

The only editable field in the OTB module is:

1. **Target Closing Stock** (Future periods only)
   - Click on a Target Closing Stock cell in a future period (after the current period)
   - Enter the desired closing inventory amount
   - The OTB value will automatically recalculate based on the formula: OTB = CP Sales + Target Closing Stock - LY Closing Stock
   - The cell shows a light slate background when editable
   - Press Enter or click outside to confirm the edit

2. **Validation:**
   - If your OTB calculation results in a negative value, the system prevents saving
   - You'll see an error message: "You cannot have a negative purchase plan."
   - Adjust your Target Closing Stock values upward to ensure positive OTB

3. **Applying Changes:**
   - Once you've edited Target Closing Stock values, the **Apply Changes** button turns blue and becomes active
   - Click **Apply Changes** to save your edits
   - A success toast notification confirms the save
   - Your edits are automatically added to the version history with timestamp and change tracking

### Version History

The system maintains a version history of up to 2 previous versions, similar to Google Docs:

1. **Viewing History:**
   - Click the **Version History** button (with clock icon) in the top right
   - See a list of recent versions with timestamps
   - Edited cells are highlighted in yellow

2. **Viewing Version Details:**
   - Click **View Version** on any saved version
   - See what changed compared to the current state
   - Changes display with old values struck through and new values in green

3. **Restoring a Version:**
   - While viewing version details, click **Restore This Version**
   - Choose to overwrite current data with the selected version
   - The system will confirm the restoration

4. **Ignoring a Version:**
   - While viewing version details, click **Ignore** to close the comparison without changes

### Switching Between Views

- **Weeks View**: Toggle to see 52 individual weeks of data
- **Periods View**: Toggle to see 13 consolidated periods
- The data adjusts automatically; edits are preserved across view switches

### Filtering Data

Use the filter dropdowns to drill down into your product hierarchy:

- **Year**: Select the fiscal year (e.g., 2025)
- **Category**: Top-level product grouping
- **Subcategory**: Sub-grouping within category
- **Merch Area**: Merchandise area (lowest level of detail)

Filters work together—selecting a category narrows available subcategories, which narrows available merch areas.

---

## Commercial Planning Module

Manage commercial strategies, pricing, and promotional planning.

- **Column Structure**: Similar to OTB with comparable period/week views
- **Editable Fields**: Specific to commercial operations (e.g., promotional spend, pricing tiers)
- **Version Tracking**: Same version history as OTB module

---

## Closing Stock Module

Track and manage closing inventory levels across periods and merchandise areas.

- **Read-only Reference Data**: See planned vs. actual closing positions
- **Alerts**: Visual indicators for variance thresholds
- **Filter Support**: Same product hierarchy filters as OTB

---

## Availability Module

Monitor inventory availability and stockout risks.

- **Stock Levels**: Current and projected inventory
- **Availability %**: Shows which SKUs/merch areas are at risk
- **Alerts**: Highlights critical availability issues

---

## Sales & Margin Analysis Module

Analyze sales performance and margin contribution.

- **Metrics**: Sales by period, margin %, variance analysis
- **Trends**: Week-over-week and period-over-period comparisons
- **Filters**: Product hierarchy drill-down available

---

## General Features

### Navigation
- **Sidebar**: Main navigation menu with collapsible sections
- **Auto-Expand**: Sidebar sections auto-expand when you select a sub-item
- **Responsive**: Collapses to save space on smaller screens

### Toasts (Notifications)
- **Success**: Green toast confirms when changes are applied
- **Error**: Red toast shows validation failures (e.g., negative OTB)
- **Duration**: Auto-dismisses after a few seconds

### Keyboard & Mouse
- **Tab Navigation**: Use Tab to move between editable cells
- **Enter**: Press Enter to confirm edits
- **Hover Effects**: Cells darken slightly on hover to show they're editable
- **Focus State**: Editable cells show blue border when focused

---

## Best Practices

1. **Plan Incrementally**: Update Target Closing Stock values based on expected sales and desired inventory turns
2. **Monitor OTB**: Ensure your OTB values stay positive; negative values indicate an unachievable plan
3. **Save Regularly**: Click Apply Changes frequently to build version history for audit trails
4. **Use Version History**: Check previous versions if you make a mistake; restoration is quick and easy
5. **Filter Down**: Use product filters to focus on specific categories or merchandise areas rather than viewing all data
6. **Review Variances**: Pay attention to variance columns in Sales & Margin analysis to identify issues early

---

## Troubleshooting

**Q: Why can't I edit a cell?**
- A: Future period fields are editable; current and past period fields are locked (read-only for actual data)

**Q: I get a "negative purchase plan" error. What do I do?**
- A: Your OTB calculation resulted in a negative value. Increase your Target Closing Stock or decrease expected sales assumptions

**Q: How do I undo a change?**
- A: Use Version History to restore a previous version. Click the Version History button and select "Restore This Version" on the prior state

**Q: Can I edit data across multiple views (weeks/periods)?**
- A: Yes, edits sync between views. Changes made in Weeks view are reflected in Periods view and vice versa

**Q: What's the difference between Target Closing Stock and Actual Closing Stock?**
- A: Target = your plan/goal | Actual = what really happened (only visible for closed periods)

---

## Support & Questions
For questions or issues, contact the dashboard administrator or refer to the in-app help sections in each module.
