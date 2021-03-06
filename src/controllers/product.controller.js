/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 * 
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 * 
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import {
  Product,
  Department,
  AttributeValue,
  Attribute,
  Category,
  ProductCategory,
  Sequelize,
  sequelize,
} from '../database/models';

const { Op } = Sequelize;

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    const { query } = req;

    const page = query.page && parseInt(query.page, 0) !== 0 ? Math.abs(query.page) - 1 : 0;
    const limit = query.limit ? parseInt(query.limit, 0) : 20;

    const offset = page * limit;
    const desc_length = query.description_length ? query.description_length : 200;

    const sqlQueryMap = {
      limit,
      offset,
      attributes: {
        include: [
          [sequelize.fn('SUBSTRING', sequelize.col('description'), 1, desc_length), 'description'],
        ],
      },
    };
    try {
      const products = await Product.findAndCountAll(sqlQueryMap);
      const { count } = products;
      const currentPage = page;
      const currentPageSize = limit;
      const totalPages = Math.ceil(count / limit);

      return res.status(200).json({
        pagination: {
          currentPage,
          currentPageSize,
          totalPages,
          totalRecords: count,
        },
        rows: products.rows,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProduct(req, res, next) {
    const { query_string, all_words } = req.query;
    const { query } = req; // eslint-disable-line
    // all_words should either be on or off
    // implement code to search product
    const page = query.page && parseInt(query.page, 0) !== 0 ? Math.abs(query.page) - 1 : 0;
    const limit = query.limit ? parseInt(query.limit, 0) : 20;

    const offset = page * limit;
    const products = await Product.findAll({
      limit,
      offset,
      where: {
        [Op.or]: [{
            name: {
              [Op.like]: `%${query_string}%`
            }
          },
          {
            description: {
              [Op.like]: `%${query_string}%`
            },
          },
        ],
      },
    });
    return res.status(200).json({ rows: products });
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {

    try {
      const { category_id } = req.params; // eslint-disable-line
      const products = await Product.findAndCountAll({
        include: [
          {
            model: Department,
            where: {
              category_id,
            },
            attributes: [],
          },
        ],
        limit,
        offset,
      });
      return next(products);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    // implement the method to get products by department
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    try {
      const product = await Product.findByPk(product_id, {
        include: [
          {
            model: AttributeValue,
            as: 'attributes',
            attributes: ['value'],
            through: {
              attributes: [],
            },
            include: [
              {
                model: Attribute,
                as: 'attribute_type',
              },
            ],
          },
        ],
      });

      if (!product) {
        return res.status(404).json({
          error: {
            status: 404,
            message: `Product with id does not exist`, // eslint-disable-line
          },
        });
      }
      return res.status(200).json(product);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await Department.findAll();
      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and Department list
   * @memberof ProductController
   */
  static async getDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    try {
      const department = await Department.findByPk(department_id);
      if (department) {
        return res.status(200).json(department);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Department with id ${department_id} does not exist`,  // eslint-disable-line
        }
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and Categories list
   * @memberof ProductController
   */
  static async getAllCategories(req, res, next) {
    // Implement code to get all categories here
    const categories = await Category.findAll();
    return res.status(200).json({
      rows: categories,
    });
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params;  // eslint-disable-line
    // implement code to get a single category here
    return res.status(200).json({ message: 'this works' });
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params;  // eslint-disable-line
    // implement code to get categories in a department here

    const department = await Department.findOne({
      where: {
        department_id,
      },
    });

    if (!department) {
      return res.status(404).json({
        error: {
          status: 404,
          code: `DEP_02`,
          message: `Don't exist department with this ID`,
          field: 'department_id',
        },
      });
    }

    const categories = await Category.findAll({
      where: {
        department_id,
      },
    });

    return res.status(200).json({ rows: categories });
  }

  /**
   * Get a single product category
   
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product category list
   * @memberof ProductController
   */
  static async getProductCategories(req, res, next) {
    const { product_id } = req.params;
    const productCategory = await ProductCategory.findOne({
      where: {
        product_id,
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'department_id', 'name'],
        },
      ],
    });
    if (!productCategory) {
      return res.status(404).json({
        error: {
          status: 404,
          code: `PRO_01`,
          message: `product with product id ${product_id} not found`,
        },
      });
    }
    const result = productCategory.category;

    return res.status(200).json(result);
  }
/**
 * Get a single category
 
 * @static
 * @param {object} req express request object
 * @param {object} res express response object
 * @param {object} next next middleware
 * @returns {json} json object with status and category content
 * @memberof ProductController
 */

  static async getCategory(req, res, next) {
    const { category_id } = req.params;
    const category = await Category.findOne({
      where: {
        category_id,
      },
    });

    if (!category) {
      return res.status(404).json({
        error: {
          status: 404,
          code: `CAT_01`,
          message: `Don't exist category with this ID.`,
          field: `category_id`,
        },
      });
    }
    return res.status(200).json(category);
  }
}

export default ProductController;
