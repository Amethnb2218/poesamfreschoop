/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} createdAt
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {'admin'|'agriculteur'|'agentTerrain'|'client'|'acheteurB2B'|'partenaire'} role
 * @property {'Actif'|'En attente'|'Suspendu'|'Inactif'} status
 * @property {string} organization
 * @property {string} region
 * @property {string} bio
 * @property {string} [passwordHash]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} createdAt
 * @property {string} ownerId
 * @property {string} name
 * @property {string} category
 * @property {number} quantity
 * @property {string} unit
 * @property {number} price
 * @property {string} zone
 * @property {'Publie'|'Brouillon'|'Suspendu'} status
 * @property {string} [description]
 * @property {string} [expiryDate]
 * @property {Array<Object>} [images]
 * @property {Object} [image]
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} createdAt
 * @property {string} productId
 * @property {string} sellerId
 * @property {string} clientId
 * @property {number} quantity
 * @property {string} unit
 * @property {number} [unitPrice]
 * @property {number} [totalPrice]
 * @property {'Nouvelle'|'Confirmee'|'En preparation'|'Livree'|'Annulee'|'Paiement en attente'} status
 * @property {string} [paymentStatus]
 * @property {string} [message]
 * @property {Object} [productSnapshot]
 * @property {string} [agentId]
 * @property {string} [transporterId]
 */

/**
 * @typedef {Object} Store
 * @property {User[]} users
 * @property {Product[]} products
 * @property {Object[]} dossiers
 * @property {Object[]} attestations
 * @property {Object[]} transactions
 * @property {Object[]} proofs
 * @property {Object[]} hubs
 * @property {Order[]} orders
 * @property {Object[]} messages
 * @property {Notification[]} notifications
 * @property {Object[]} lots
 * @property {Object[]} buyerOrders
 * @property {Object[]} reservations
 * @property {Object[]} paymentRecords
 * @property {Object[]} consentRecords
 * @property {Object[]} auditLogs
 * @property {Object[]} loans
 * @property {Object[]} surveyLeads
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} createdAt
 * @property {string} [recipientId]
 * @property {string} [recipientRole]
 * @property {string[]} [recipientRoles]
 * @property {string} [actorId]
 * @property {string} type
 * @property {string} title
 * @property {string} body
 * @property {string} [path]
 * @property {string} [relatedId]
 * @property {boolean} read
 * @property {string} [readAt]
 */

/**
 * @typedef {Object} CartItem
 * @property {string} productId
 * @property {string} sellerId
 * @property {Object} product
 * @property {number} quantity
 */

/**
 * @typedef {Object} Hub
 * @property {string} id
 * @property {string} name
 * @property {string} zone
 * @property {string} ownerId
 * @property {number} capacity
 * @property {number} temperature
 * @property {number} battery
 * @property {string} status
 */

/**
 * @typedef {Object} Lot
 * @property {string} id
 * @property {string} productId
 * @property {string} hubId
 * @property {string} status
 * @property {string} createdAt
 * @property {number} [quantity]
 * @property {string} [zone]
 */

export {};
