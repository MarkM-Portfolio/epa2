const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    areacode: { type: String },
    mobilenum: { type: String, required: true },
    password: { type: String, required: true },
    refnum: { type: String, required: true, unique: true },
    eWalletnum: { type: String, required: true, unique: true },
    shippingAddress: { type: Object },
    avatar: { type: String },
    class: { type: String, required: true },
    rank: { type: String },
    role: { type: String, required: true },
    gender: { type: String },
    birthday: { type: String },
    religion: { type: String },
    cart: [{ type: Object }],
    entrepreneur: { type: String, default: 'Pending' },
    supervisor: { type: String, default: 'Pending' },
    manager: { type: String, default: 'Pending' },
    ceo: { type: String, default: 'Pending' },
    businessempire: { type: String, default: 'Pending' },
    delegatePin: { type: String },
    idImage1: { type: String },
    idImage2: { type: String },
    idImage3: { type: String },
    status: { type: String },
    spouse: { type: String },
    father: { type: String },
    mother: { type: String },
    sibling1: { type: String },
    sibling2: { type: String },
    sibling3: { type: String },
    sibling4: { type: String },
    sibling5: { type: String },
    otherSiblings: { type: String },
    currentCompany: { type: String },
    currentJob: { type: String },
    dreamJob: { type: String },
    salaryEmployed: { type: mongoose.Types.Decimal128 },
    salarySelfEmployed: { type: mongoose.Types.Decimal128 },
    salaryPension: { type: mongoose.Types.Decimal128 },
    dependents: { type: Number },
    isVerified: { type: Boolean },
    isAutoDonateUhw: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    isEpaCreditCommission: { type: Boolean, default: false },
    isEpaVaultCommission: { type: Boolean, default: false },
    isEpaUpgradeCommission: { type: Boolean, default: false },
    isLegsComplete: { type: Boolean, default: false },
    isSubAccount: { type: Boolean },
    subAccounts: [{ type: Object, default: null }],
    owner: { type: String },
    sponsor: { type: String },
    parent: { type: String },
    children: [{ type: Object }],
    teams: [],
    iou: [{ type: Object, default: null }],
    loanamount: [{ type: Object, default: null }],
    epacash: { type: mongoose.Types.Decimal128 },
    epacredits: { type: mongoose.Types.Decimal128 },
    epavault: { type: mongoose.Types.Decimal128 },
    epatokens: { type: mongoose.Types.Decimal128 },
    totalIncome: { type: mongoose.Types.Decimal128 },
    epacashTotal: { type: mongoose.Types.Decimal128 }, // for non-verified users
    epaCreditsMonth: { type: mongoose.Types.Decimal128 },
    ecomVault: { type: mongoose.Types.Decimal128 },
    quota: { type: mongoose.Types.Decimal128 },
    quotaSubWeek: { type: mongoose.Types.Decimal128 },
    tokens: [{ type: Object }],
    createdAt: { type: String },
    updatedAt: { type: String }
})

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {

        bcrypt.hash(this.password, 8, (err, hash) => {
        if (err) return next(err)
            this.password = hash
            next()
        })
    }
})
  
userSchema.methods.comparePassword = async function (password) {
    if (!password) throw new Error('Password is missing, can not compare!')

    try {
        const result = await bcrypt.compare(password, this.password)
        return result
    } catch (error) {
        console.log('Error while comparing password!', error.message)
    }
}

userSchema.statics.isNameInUse = async function (name) {
    if (!name) throw new Error('Name is invalid!')

    try {
        const user = await this.findOne({ name })
        if (user) return false

        return true
    } catch (e) {
        console.log('Duplicate Name!', e.message)
        return false
    }
}

userSchema.statics.isEmailInUse = async function (email) {
    email = email.toLowerCase()

    if (!email) throw new Error('Email is invalid!')

    try {
        const user = await this.findOne({ email })
        if (user) return false

        return true
    } catch (e) {
        console.log('Duplicate Email!', e.message)
        return false
    }
}

userSchema.statics.isMobileInUse = async function (mobilenum) {
    if (!mobilenum) throw new Error('Invalid Mobile Number')

    try {
        const user = await this.findOne({ mobilenum })

        if (user) return false

        return true
    } catch (e) {
        console.log('Duplicate Mobile Number!', e.message)
        return false
    }
}

userSchema.statics.addRef = async function (refnum) {
    try {
        const user = await this.findOne({ refnum })

        if (user.class !== 'Member') return user

        return false
    } catch (e) {
        console.log('No Reference!', e.message)
        return false
    }
}

const otpSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pin: { type: String, required: true, unique: true },
    token: { type: String, required: true, unique: true }
})

const loadSchema = new mongoose.Schema({
    // image: { type: String },
    type: { type: String, required: true },
    owner: { type: String, required: true },
    sender: { type: String, require: true },
    recipient: { type: String, required: true },
    email : { type: String, require: true },
    areacode: { type: String },
    mobilenum: { type: String, required: true },
    amount: { type: mongoose.Types.Decimal128, required: true },
    refnum: { type: Number, required: true, unique: true },
    isIouConfirmed: { type: Boolean, default: true },
    interest: { type: mongoose.Types.Decimal128 },
    terms: { type: Number },
    duration: { type: String },
    eWalletNum: { type: String },
    isGold: { type: Boolean, default: false },
    // paymentMethod: { type: String, require: true },
    // paymentMode: { type: String, require: true },
    // status: { type: String, default: 'Pending', require: true },
    createdAt: { type: Date, default: Date.now },
    // updatedAt: { type: Date, default: Date.now }
})

const notifSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String },
    isRead: { type: Boolean, required: true, default: false },
    tags: { type: String },
    createdAt: { type: String }
})

// const pkgSchema = new mongoose.Schema({
//     package: { type: Object }
// })

const storeSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    image: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    areacode: { type: String },
    contactnumber: { type: String, required: true },
    address: { type: String, String: true },
    city: { type: String, String: true },
    province: { type: String, String: true },
    zipcode: { type: Number, String: true },
    country: { type: String, String: true },
    favorites: [],
    createdAt: { type: String },
    updatedAt: { type: String }
})

const productSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    store: { type: String },
    image: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    token: { type: String, required: true, default: 'low' },
    category: { type: Object, required: true },
    price: { type: Number, required: true },
    bonusToken: { type: mongoose.Types.Decimal128 },
    stocks: { type: Number },
    fees: { type: mongoose.Types.Decimal128 },
    extra: { type: mongoose.Types.Decimal128 },
    favorites: [],
    ratings: [],
    globalRating: { type: String, default: '0.0' },
    quantity: { type: Number, default: 1 },
    createdAt: { type: String },
    updatedAt: { type: String }
})

const serviceSchema = new mongoose.Schema({
    owner: { type: String, required: true },
    store: { type: String },
    image: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    token: { type: String, required: true, default: 'low' },
    category: { type: Object, required: true },
    price: { type: Number, required: true },
    bonusToken: { type: mongoose.Types.Decimal128 },
    rate: { type: String, required: true },
    fees: { type: mongoose.Types.Decimal128 },
    extra: { type: mongoose.Types.Decimal128 },
    favorites: [],
    ratings: [],
    globalRating: { type: String, default: '0.0' },
    createdAt: { type: String },
    updatedAt: { type: String },
})

const orderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    areacode: { type: String },
    mobilenum: { type: String, required: true },
    shippingAddress: { type: Object, required: true },
    details: { type: Object, required: true },
    price: { type: Number, required: true },
    idImage1: { type: String },
    idImage2: { type: String },
    idImage3: { type: String },
    isPaid: { type: Boolean, default: false },
    createdAt: { type: String },
    updatedAt: { type: String }
})

const paymentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, required: true },
    reference_number: { type: String },
    amount: { type: Number, required: true },
    payment_methods: [],
    payment_gateway: { type: String },
    payment_provider: { type: Object },
    currency: { type: String, required: true },
    payment_id: { type: String },
    payment_request_id: { type: String },
    purpose: { type: String },
    redirect_url: { type: String },
    fixed_fee: { type: Number },
    discount_fee: { type: Number },
    discount_fee_rate: { type: Number },
    refunded_amount: { type: Number },
    webhook: { type: String },
    allow_repeated_payments: { type: Boolean, default: false },
    expiry_date: { type: String },
    created_at: { type: String },
    updated_at: { type: String },
    closed_at: { type: String }
})

const deliverySchema = new mongoose.Schema({
    sender: { type: String, required: true },
    recepient: { type: String, required: true },
    channel: { type: Object, required: true },
    details: { type: Object, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number },
    deliveryData: { type: Object },
    createdAt: { type: String },
    updatedAt: { type: String }
})

const transactionSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    buyer: { type: String },
    // buyerEpaVault: { type: Number },
    // buyerEpaCredits: { type: Number },
    // buyerEpaTokens: { type: Number },
    // buyerQuota: { type: Number },
    seller: { type: String },
    // sellerEpaVault: { type: Number },
    // sellerEpaCash: { type: Number },
    // sellerEpaTokens: { type: Number },
    // sellerQuota: { type: Number },
    amount: { type: Number, },
    details: { type: Object },
    createdAt: { type: String },
    updatedAt: { type: String }
})

// const messageSchema = new mongoose.Schema({
//     owner: { type: String, required: true },
//     sender: { type: String, required: true },
//     recepient: { type: String, required: true },
//     conversation: { type: String, required: true },
//     channel: { type: String, required: true },
//     message: { type: String, required: true },
//     createdAt: { type: String },
//     updatedAt: { type: String },
//     closedAt: { type: String }
// })

const chatSchema = new mongoose.Schema({
    sender: { type: Object, required: true },
    receiver: { type: Object, required: true }, // Represents the owner_id or user_id
    message: [{ type: Object }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    closedAt: { type: Date }
})

const settingSchema = new mongoose.Schema({
    banners: [],
    showVoucher: { type: Boolean },
    isAutoPay: { type: Boolean },
    isAutoCreateEpa: { type: Boolean },
    highToken: { type: Number, default: 0.3333 },
    lowToken: { type: Number, default: 0.1539 },
    monthlyVaultInterest: { type: Number, default: 0.015 },
    base: { type: mongoose.Types.Decimal128 },
    lvlBonus:{ type: mongoose.Types.Decimal128 },
    passive: { type: mongoose.Types.Decimal128 },
    bonusForMerchants:{ type: Number, default: 0.25 }, 
    rewardsJBA: { type: Number, default: 370 },
    allowanceJBA: { type: Number, default: 175 },
    dependentsJBA: { type: Number, default: 308 }, 
    employedJBA: { type: Number, default: 980 },
    maxEmployedJBA: { type: Number, default: 1029 },
    selfEmployedJBA: { type: Number, default: 713 },
    maxSelfEmployedJBA: { type: Number, default: 2020 },
    pensionJBA: { type: Number, default: 750 },
    maxPensionJBA: { type: Number, default: 1429 },
    entrepSolopreneurJBA: { type: Number, default: 1 },
    entrepSolopreneurFee: { type: Number, default: 1000 },
    entrepApprenticeJBA: { type: Number, default: 370 },
    entrepApprenticeFee: { type: Number, default: 3000 },
    entrepTeamLeaderJBA: { type: Number, default: 900 },
    entrepTeamLeaderFee: { type: Number, default: 5000 },
    entrepEntrepJBA: { type: Number, default: 5000 },
    entrepEntrepFee: { type: Number, default: 7000 },
    supervSupervisorJBA: { type: Number, default: 10000 },
    supervSupervisorFee: { type: Number, default: 10000 },
    managerManagerJBA: { type: Number, default: 25001 },
    managerManagerFee: { type: Number, default: 13000 },
    ceoApprenticeJBA: { type: Number, default: 40001 },
    ceoApprenticeFee: { type: Number, default: 15000 },
    ceoCeoJBA: { type: Number, default: 55001 },
    ceoCeoFee: { type: Number, default: 18000 },
    businessEmpireJBA: { type: Number, default: 70001 },
    businessEmpireFee: { type: Number, default: 21000 },
    silverEntrepreneurJBA: { type: Number, default: 100001 },
    silverEntrepreneurFee: { type: Number, default: 100000 },
    silverSupervisorJBA: { type: Number, default: 150001 },
    silverSupervisorFee: { type: Number, default: 200000 },
    silverManagerJBA: { type: Number, default: 250001 },
    silverManagerFee: { type: Number, default: 300000 },
    silverCeoJBA: { type: Number, default: 350001 },
    silverCeoFee: { type: Number, default: 500000 },
    silverBusinessJBA: { type: Number, default: 450001 },
    silverBusinessFee: { type: Number, default: 800000 },
    goldEntrepreneurJBA: { type: Number, default: 500001 },
    goldEntrepreneurFee: { type: Number, default: 1000000 },
    goldSupervisorJBA: { type: Number, default: 550001 },
    goldSupervisorFee: { type: Number, default: 2000000 },
    goldManagerJBA: { type: Number, default: 650001 },
    goldManagerFee: { type: Number, default: 3000000 },
    goldCeoJBA: { type: Number, default: 750001 },
    goldCeoFee: { type: Number, default: 4000000 },
    goldBusinessJBA: { type: Number, default: 850001 },
    goldBusinessFee: { type: Number, default: 5000000 },
    entrepPercentCash: { type: Number, default: 0.05 },
    supervPercentCash: { type: Number, default: 0.10 },
    managerPercentCash: { type: Number, default: 0.15 },
    ceoPercentCash: { type: Number, default: 0.20 },
    businessPercentCash: { type: Number, default: 0.20 },
    silverPercentCash: { type: Number, default: 0.25 }, // Manager
    goldPercentCash: { type: Number, default: 0.30 },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
const Otp = mongoose.model('Otp', otpSchema)
const Load = mongoose.model('Load', loadSchema)
const Notification = mongoose.model('Notification', notifSchema)
// const Package = mongoose.model('Package', pkgSchema)
const Store = mongoose.model('Store', storeSchema)
const Product = mongoose.model('Product', productSchema)
const Service = mongoose.model('Service', serviceSchema)
const Order = mongoose.model('Order', orderSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const Delivery = mongoose.model('Delivery', deliverySchema)
const Transaction = mongoose.model('Transaction', transactionSchema)
// const Message = mongoose.model('Message', messageSchema)
const Chat = mongoose.model('Chat', chatSchema)
const Setting = mongoose.model('Settings', settingSchema)

module.exports = { User, Otp, Load, Notification, /* Package, */ Store, Product, Service,
                    Order, Payment, Delivery, Transaction, /* Message, */ Chat, Setting }
