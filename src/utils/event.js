export const Event = {
    PaymentCard: "PaymentCard",
    PaymentPayerMax: "PaymentPayerMax",
    PaymentAliGooglePay: "PaymentAliGooglePay",
    PaymentAliApplePay: "PaymentAliApplePay",
    PaymentAliCardPay: "PaymentAliCardPay",
    PaymentAliJKoPay: "PaymentAliJKoPay",
    PaymentAliMorePay: "PaymentAliMorePay",
    AdsClick: "AdsClick",
    GiftClick: "GiftClick",
    ActivityTelegramFission: "ActivityTelegramFission",
    ActivityLineFission: "ActivityLineFission",
    HistoryEntry: "HistoryEntry",
    SupportEntry: "SupportEntry",
    ShareEntry: "ShareEntry",
    MessageEntry: "MessageEntry",
    ShareToast: "ShareToast",
}

export function Occur(event){
    window.clarity?.("event",event)
}