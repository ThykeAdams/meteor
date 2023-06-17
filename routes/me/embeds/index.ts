/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-negated-condition */
import { Router } from 'express';
import { WebAuthHandler } from '../../../middleware/auth';

const router = Router();

/**
 * @route   POST /
 * ? reate a new Embed
 * @access  Private
 */

router.post('/', WebAuthHandler, async (req, res) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const {
		enabled,
		name,
		title,
		description,
		provider,
		author,
		color
	} = req.body;

	// Validate the body by ensuring that the values dont exceed the max length
	if (title.length > 256) return res.status(400).json({ error: 'Title cannot exceed 256 characters' });
	if (description.length > 2048) return res.status(400).json({ error: 'Description cannot exceed 2048 characters' });
	if (provider.name.length > 256) return res.status(400).json({ error: 'Provider name cannot exceed 256 characters' });
	if (author.name.length > 256) return res.status(400).json({ error: 'Author name cannot exceed 256 characters' });

	// Valdate the color is a valid hex code
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) return res.status(400).json({ error: 'Invalid color.' });

	// See if embed already exists by name, if not create it
	let embed = await req.db.embed.findFirst({
		where: {
			userId: req.user?.id,
			name
		}
	});
	if (!embed) {
		embed = await req.db.embed.create({
			data: {
				enabled,
				name,
				title,
				description,
				provider,
				author,
				color,
				user: {
					connect: {
						id: req.user?.id
					}
				}
			}
		});
	} else {
		embed = await req.db.embed.update({
			where: {
				id: embed.id
			},
			data: {
				enabled,
				name,
				title,
				description,
				provider,
				author,
				color
			}
		});
	}

	res.json(embed);
});

/**
 * @route   GET /
 * ? Get All User Embeds
 * @access  Private
 * @returns {Embed[]}
 * * This route is designed to get all user embeds
*/
router.get('/', WebAuthHandler, async (req, res) => {
	const dbEmbeds = await req.db.embed.findMany({
		where: {
			userId: req.user?.id
		}
	});
	return res.json(dbEmbeds);
});

export default router;
