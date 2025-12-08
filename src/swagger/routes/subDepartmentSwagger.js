/**
 * @swagger
 * tags:
 *   name: SubDepartments
 *   description: Offices/Unit Management
 */

/**
 * @swagger
 * /api/sub-departments/create:
 *   post:
 *     summary: Create SubDepartment
 *     tags: [SubDepartments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: {$ref: '#/components/schemas/SubDepartment'}
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             example:
 *               message: "SubDepartment created"
 *               subDepartment:
 *                 name: {en: "PHC Makani", mr: "प्रा.आ. केंद्र"}
 *                 subDeptId: "SUB001"
 *                 parentDeptId: "DEP001"
 *                 level: "village"
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Parent Department not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/sub-departments/all:
 *   get:
 *     summary: Get All SubDepartments
 *     tags: [SubDepartments]
 *     responses:
 *       200: {description: List of sub-departments}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/sub-departments/{subDeptId}:
 *   get:
 *     summary: Get SubDepartment by ID
 *     tags: [SubDepartments]
 *     parameters:
 *       - in: path
 *         name: subDeptId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Found}
 *       404: {description: Not found}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/sub-departments/update/{subDeptId}:
 *   put:
 *     summary: Update SubDepartment
 *     tags: [SubDepartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subDeptId
 *         required: true
 *         schema: {type: string}
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: {$ref: '#/components/schemas/SubDepartment'}
 *     responses:
 *       200: {description: Updated}
 *       404: {description: Parent Dept or SubDept not found}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/sub-departments/delete/{subDeptId}:
 *   delete:
 *     summary: Delete SubDepartment
 *     tags: [SubDepartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subDeptId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Deleted}
 *       404: {description: SubDepartment not found}
 *       500: {description: Server error}
 */
