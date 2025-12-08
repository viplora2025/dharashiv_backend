/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Administrative Departments
 */

/**
 * @swagger
 * /api/departments/create:
 *   post:
 *     summary: Create Department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: {$ref: '#/components/schemas/Department'}
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             example:
 *               message: "Department created"
 *               department:
 *                 name: {en: "Health", mr: "आरोग्य"}
 *                 deptId: "DEP001"
 *                 level: "district"
 *       400:
 *         description: Missing fields (en/mr names)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/departments/all:
 *   get:
 *     summary: Get All Departments
 *     tags: [Departments]
 *     responses:
 *       200: {description: List of departments}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/departments/{deptId}:
 *   get:
 *     summary: Get Department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: deptId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Found}
 *       404: {description: Department not found}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/departments/update/{deptId}:
 *   put:
 *     summary: Update Department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deptId
 *         required: true
 *         schema: {type: string}
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: {$ref: '#/components/schemas/Department'}
 *     responses:
 *       200: {description: Updated}
 *       400: {description: Missing fields}
 *       404: {description: Department not found}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/departments/delete/{deptId}:
 *   delete:
 *     summary: Delete Department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deptId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Deleted}
 *       404: {description: Department not found}
 *       500: {description: Server error}
 */
