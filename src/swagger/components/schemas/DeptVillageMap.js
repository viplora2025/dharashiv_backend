/**
 * @swagger
 * components:
 *   schemas:
 *     DeptVillageMap:
 *       type: object
 *       required:
 *         - subDepartment
 *         - village
 *         - level
 *       properties:
 *         _id:
 *           type: string
 *         subDepartment:
 *           type: string
 *           description: Reference to SubDepartment ID
 *         village:
 *           type: string
 *           description: Reference to Village ID
 *         level:
 *           type: string
 *           enum: [primary, secondary]
 *         priority:
 *           type: number
 *       example:
 *         subDepartment: "654321..."
 *         village: "123456..."
 *         level: "primary"
 *         priority: 1
 */
