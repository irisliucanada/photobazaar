const tagModel = require('../models/tag.model');

class TagController {
    async createTag(req, res) {
        try {
            const { tag } = req.body;
            if (!tag) {
                return res.status(400).json({ message: 'Tag name is required' });
            }
            const count = (req.body.count) ? req.body.count : 0
            const newTagId = await tagModel.createTag(tag, count)
            res.status(200).json({ message: 'Tag created', tagId: newTagId });
        } catch (error) {
            console.error('Error creating tag:', error);
            res.status(500).json({ message: 'Error creating tag' });
        }
    }

    async getAllTags(req, res) {
        try {
            const tags = await tagModel.getAllTags();
            res.status(200).json(tags);
            // console.log(tags);
        } catch (error) {
            console.error('Error fetching tags:', error);
            res.status(500).json({ message: 'Error fetching tags' });
        }
    }

    async getTagById(req, res) {
        try {
            const { id } = req.params;
            const tag = await tagModel.getTagById(id);
            if (!tag) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            res.status(200).json(tag);
        } catch (error) {
            console.error('Error fetching tag by ID:', error);
            res.status(500).json({ message: 'Error fetching tag by ID' });
        }
    }

    async updateTag(req, res) {
        try {
            const { id } = req.params;
            const existingTag = await tagModel.getTagById(id);
            if (!existingTag) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            const tag = req.body.tag ? req.body.tag : existingTag.tag
            let count = req.body.count ? req.body.count : existingTag.count
            count = req.body.increseBy ? count + req.body.increseBy : count
            const updatedCount = await tagModel.updateTag(id, { tag, count });
            if (updatedCount === 0) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            res.status(200).json({ message: 'Tag updated' });
        } catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({ message: 'Error updating tag' });
        }
    }

    async deleteTag(req, res) {
        try {
            const { id } = req.params;
            const deletedCount = await tagModel.deleteTag(id);
            if (deletedCount === 0) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            res.status(200).json({ message: 'Tag deleted' });
        } catch (error) {
            console.error('Error deleting tag:', error);
            res.status(500).json({ message: 'Error deleting tag' });
        }
    }

    // increase tag count after artwork is uploaded
    async increaseTagCount(req, res) {
        try {
            const { id } = req.params;
            const existingTag = await tagModel.getTagById(id);
            if (!existingTag) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            const updatedCount = await tagModel.increaseTagCount(id);
            if (updatedCount === 0) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            res.status(200).json({ message: 'Tag updated' });
        } catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({ message: 'Error updating tag' });
        }
    }

    // decrease tag count after artwork is deleted
    async decreaseTagCount(req, res) {
        try {
            const { id } = req.params;
            const existingTag = await tagModel.getTagById(id);
            if (!existingTag) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            const updatedCount = await tagModel.decreaseTagCount(id);
            if (updatedCount === 0) {
                return res.status(404).json({ message: 'Tag not found' });
            }
            res.status(200).json({ message: 'Tag updated' });
        } catch (error) {
            console.error('Error updating tag:', error);
            res.status(500).json({ message: 'Error updating tag' });
        }
    }
}

module.exports = new TagController();
