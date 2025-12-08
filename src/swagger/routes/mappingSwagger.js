/**
 * @swagger
 * tags:
 *   name: Mappings
 *   description: Smart Routing (Department <-> Village)
 */

/**
 * @swagger
 * /api/mappings/create:
 *   post:
 *     summary: Create Single Mapping
 *     tags: [Mappings]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: {$ref: '#/components/schemas/DeptVillageMap'}
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             example:
 *               message: "Mapping created"
 *               mapping:
 *                 villageId: "VLG001"
 *                 deptId: "DEP001"
 *                 subDeptId: "SUB001"
 *       400:
 *         description: Missing required fields or Duplicate
 *       404:
 *         description: SubDepartment or Village not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/mappings/bulk:
 *   post:
 *     summary: Bulk Create Mappings
 *     tags: [Mappings]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items: {$ref: '#/components/schemas/DeptVillageMap'}
 *     responses:
 *       201: {description: Created}
 *       400: {description: Invalid array}
 *       500: {description: Server error}
 */

/**
 * @swagger
 * /api/mappings/search:
 *   get:
 *     summary: Smart Routing Search
 *     description: Find responsible SubDepartment for a Village & Department
 *     tags: [Mappings]
 *     parameters:
 *       - in: query
 *         name: villageId
 *         required: true
 *         schema: {type: string}
 *       - in: query
 *         name: deptId
 *         required: true
 *         schema: {type: string}
 *     responses:
 *       200: {description: Found SubDepartment}
 *       400: {description: Missing query params}
 *       404: {description: Assignee not found}
 *       500: {description: Server error}
 */
