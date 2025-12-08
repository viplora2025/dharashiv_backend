/**
 * @swagger
 * components:
 *   schemas:
 *     Complaint:
 *       type: object
 *       required:
 *         - complaintId
 *         - filedBy
 *         - complainer
 *         - village
 *         - department
 *         - subDepartment
 *         - subject
 *         - description
 *       properties:
 *         _id:
 *           type: string
 *         complaintId:
 *           type: string
 *           description: Custom ID (e.g. CMP-A1B2-C3D4-001)
 *         filedBy:
 *           type: string
 *           description: AppUser ID (ObjectId or String)
 *         complainer:
 *           type: string
 *           description: Complainer ID
 *         village:
 *           type: string
 *           description: Village ID
 *         department:
 *           type: string
 *           description: Department ID
 *         subDepartment:
 *           type: string
 *           description: SubDepartment ID
 *         subject:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [open, in-progress, resolved, closed]
 *         media:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type: 
 *                 type: string
 *                 enum: [image, video, pdf, audio]
 *               url:
 *                 type: string
 *       example:
 *         complaintId: "CMP-001"
 *         subject: "Water Leakage"
 *         description: "Pipe burst near main road"
 *         status: "open"
 */
