/**
 * @swagger
 * components:
 *   schemas:
 *     SubDepartment:
 *       type: object
 *       required:
 *         - subDeptId
 *         - parentDept
 *         - name
 *         - level
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         subDeptId:
 *           type: string
 *           description: Custom SubDepartment ID (e.g. "SUB001")
 *         parentDept:
 *           type: string
 *           description: Reference to Department ID
 *         name:
 *           type: object
 *           properties:
 *             en:
 *               type: string
 *             mr:
 *               type: string
 *         level:
 *           type: string
 *           enum: [taluka, cluster, village, town, district]
 *         address:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *       example:
 *         subDeptId: "SUB001"
 *         parentDept: "654321..."
 *         name:
 *           en: "City Police Station"
 *           mr: "शहर पोलीस स्टेशन"
 *         level: "taluka"
 *         address: "Main Road"
 *         phone: "100"
 */
