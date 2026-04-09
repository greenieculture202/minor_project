const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();

// Get all blogs; seed if empty
router.get('/', async (req, res) => {
  try {
    const count = await Blog.countDocuments();
    if (count === 0) {
      const initialBlogs = [
        {
          title: 'Top 5 Air Purifying Plants',
          excerpt: 'Discover which plants can help you breathe easier and improve your indoor air quality.',
          content: 'In today’s world, indoor air quality is a major concern. Fortunately, nature has a solution. Here are the top 5 plants that act as natural air purifiers:\n\n1. **Snake Plant (Sansevieria)**: Known for filtering out formaldehyde and nitrogen oxide.\n2. **Spider Plant**: Great for battling benzene, formaldehyde, carbon monoxide, and xylene.\n3. **Peace Lily**: Breaks down toxic gases like carbon monoxide and formaldehyde.\n4. **Aloe Vera**: Clears formaldehyde and benzene, which can be a byproduct of chemical-based cleaners.\n5. **Rubber Plant**: Effective at removing toxins and absorbing carbon monoxide.\n\nAdding these to your home not only beautifies the space but also helps you breathe cleaner air.',
          image: 'assets/blog_health.png',
          category: 'Health',
          date: new Date('2026-01-24')
        },
        {
          title: 'A Beginner’s Guide to Succulents',
          excerpt: 'Succulents are low maintenance and beautiful. Here is how to keep them thriving.',
          content: 'Succulents are perfect for those who want greenery without the high maintenance. Here is how to keep them happy:\n\n*   **Light**: They love bright, indirect sunlight. A south-facing window is ideal.\n*   **Water**: The biggest killer of succulents is overwatering. wait until the soil is completely dry before watering again. soak them thoroughly, then let them drain.\n*   **Soil**: Use a well-draining cactus or succulent mix.\n*   **Temperature**: They prefer warm temperatures and cannot tolerate frost.\n\nWith just a little attention, your succulents will thrive for years.',
          image: 'assets/blog_guide.png',
          category: 'Guide',
          date: new Date('2026-01-20')
        },
        {
          title: 'Designing Your Home with Greenery',
          excerpt: 'Learn how to style your living room with large statement plants and small accents.',
          content: 'Plants can transform a house into a home. Here are some design tips:\n\n*   **Create Levels**: Use plant stands or hang plants from the ceiling to draw the eye up.\n*   **Mix Textures**: Combine broad-leaf plants like Monsteras with fine-textured ferns.\n*   **Group Plants**: Odd numbers (groups of 3 or 5) tend to look more aesthetic.\n*   **Statement Pieces**: A large Fiddle Leaf Fig or Bird of Paradise can act as a living sculpture in a corner.\n\nDon\'t be afraid to experiment and find what works for your space!',
          image: 'assets/blog_design.png',
          category: 'Design',
          date: new Date('2026-01-15')
        }
      ];
      await Blog.insertMany(initialBlogs);
    }
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a blog
router.post('/', async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    const savedBlog = await newBlog.save();
    res.json(savedBlog);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a blog
router.put('/:id', async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a blog
router.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
