/**
 * @swagger
 * components:
 *   schemas:
 *     Village:
 *       type: object
 *       required:
 *         - villageId
 *         - name
 *         - taluka
 *       properties:
 *         _id:
 *           type: string
 *         villageId:
 *           type: string
 *         name:
 *           type: object
 *           properties:
 *             en:
 *               type: string
 *             mr:
 *               type: string
 *         taluka:
 *           type: string
 *           description: Reference to Taluka ID
 *       example:
 *         villageId: "VLG001"
 *         name:
 *           en: "Wadgaon"
 *           mr: "वडगाव"
 *         taluka: "654321..."
 */
