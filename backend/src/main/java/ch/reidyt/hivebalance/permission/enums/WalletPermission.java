package ch.reidyt.hivebalance.permission.enums;

public enum WalletPermission {
    VIEWER,   // Can only read expenses
    EDITOR,   // Can add, update, and delete their own expenses
    ADMIN,    // Can update and delete all expenses
    OWNER     // Can invite and remove users
}
