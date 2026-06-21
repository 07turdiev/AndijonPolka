const { Op } = require('sequelize');

// Get all quarters
module.exports.getQuarters = async (req, res) => {
    try {
        const quarters = await req.db.quarters.findAll({
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: quarters
        });
    } catch (error) {
        console.error('Error fetching quarters:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get single quarter
module.exports.getQuarter = async (req, res) => {
    try {
        const { id } = req.params;
        
        const quarter = await req.db.quarters.findByPk(id);
        
        if (!quarter) {
            return res.status(404).json({
                success: false,
                message: 'Quarter not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: quarter
        });
    } catch (error) {
        console.error('Error fetching quarter:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create new quarter
module.exports.createQuarter = async (req, res) => {
    try {
        const { name, date } = req.body;

        if (!name || !date) {
            return res.status(400).json({
                success: false,
                message: 'Name and date are required'
            });
        }

        const quarter = await req.db.quarters.create({
            name,
            date: new Date(date),
            status: 'active'
        });

        return res.status(201).json({
            success: true,
            data: quarter,
            message: 'Quarter created successfully'
        });
    } catch (error) {
        console.error('Error creating quarter:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update quarter
module.exports.updateQuarter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, date, status } = req.body;

        const quarter = await req.db.quarters.findByPk(id);
        
        if (!quarter) {
            return res.status(404).json({
                success: false,
                message: 'Quarter not found'
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (date) updateData.date = new Date(date);
        if (status) updateData.status = status;

        await quarter.update(updateData);

        return res.status(200).json({
            success: true,
            data: quarter,
            message: 'Quarter updated successfully'
        });
    } catch (error) {
        console.error('Error updating quarter:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete quarter
module.exports.deleteQuarter = async (req, res) => {
    try {
        const { id } = req.params;

        const quarter = await req.db.quarters.findByPk(id);
        
        if (!quarter) {
            return res.status(404).json({
                success: false,
                message: 'Quarter not found'
            });
        }

        // Check if quarter is being used by certificates or applications
        const certificatesCount = await req.db.certificates.count({
            where: { quarter_id: id }
        });

        const applicationsCount = await req.db.applications.count({
            where: { quarter_id: id }
        });

        if (certificatesCount > 0 || applicationsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete quarter that is being used by certificates or applications'
            });
        }

        await quarter.destroy();

        return res.status(200).json({
            success: true,
            message: 'Quarter deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quarter:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get quarters for dropdown (active only)
module.exports.getActiveQuarters = async (req, res) => {
    try {
        const quarters = await req.db.quarters.findAll({
            where: { status: 'active' },
            order: [['date', 'DESC']],
            attributes: ['quarter_id', 'name', 'date']
        });

        return res.status(200).json({
            success: true,
            data: quarters
        });
    } catch (error) {
        console.error('Error fetching active quarters:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
