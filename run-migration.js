// Run database migration to add supplier_id to products table
const db = require('./src/models');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add supplier_id to products table...');
    
    // Check if supplier_id column already exists
    const [results] = await db.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'supplier_id'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (results.length > 0) {
      console.log('✅ supplier_id column already exists in products table');
      return;
    }
    
    // Add supplier_id column
    await db.sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN supplier_id INT NOT NULL DEFAULT 1
    `);
    console.log('✅ Added supplier_id column to products table');
    
    // Add foreign key constraint
    await db.sequelize.query(`
      ALTER TABLE products 
      ADD CONSTRAINT fk_products_supplier 
      FOREIGN KEY (supplier_id) REFERENCES supplier(id) 
      ON DELETE RESTRICT ON UPDATE CASCADE
    `);
    console.log('✅ Added foreign key constraint');
    
    // Add index for better performance
    await db.sequelize.query(`
      CREATE INDEX idx_products_supplier_id ON products(supplier_id)
    `);
    console.log('✅ Added index for supplier_id');
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // If it's a duplicate key error, it might be that the constraint already exists
    if (error.message.includes('Duplicate key name') || error.message.includes('already exists')) {
      console.log('⚠️  Some constraints may already exist, continuing...');
    } else {
      throw error;
    }
  } finally {
    await db.sequelize.close();
  }
}

runMigration().catch(console.error);