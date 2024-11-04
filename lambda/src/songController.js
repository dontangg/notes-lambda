'use strict';

const AWS = require('aws-sdk');
const competitionDb = require('./db/competition');
const allSongsDb = require('./db/allSongs');

const songController = {

	getUploadUrl: async (req) => {
		const uploadInfo = JSON.parse(req.body);

		const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-west-2' });

		const uploadUrl = await s3.getSignedUrlPromise('putObject', {
			Bucket: 'wilson-notes',
			Key: `uploads/${uploadInfo.filename}.${uploadInfo.extension}`,
			Expires: 180, // 180s = 3 mins, 900s is the default (15 mins)
			ContentType: uploadInfo.type, // eg. 'audio/mpeg'
		});

		return { statusCode: 200, body: JSON.stringify({ uploadUrl }) };
	},

	triggerTranscoder: async (req) => {
		const fileInfo = JSON.parse(req.body);

		const transcoder = new AWS.ElasticTranscoder({ region: 'us-west-2' });
		await transcoder.createJob({
			PipelineId: '1390029519400-paneaz',
			Input: {
				Key: `uploads/${fileInfo.filename}.${fileInfo.extension}`,
				Container: 'auto', // auto-detect the existing file's container (eg. mp3, ogg, etc)
			},
			OutputKeyPrefix: `t/${fileInfo.filename}/`, // each output key will have this prefix
			Outputs: [
				{
					Key: 'segment.ts',
					PresetId: '1351620000001-200050',
					SegmentDuration: '30' // Create 30 second segments
				},
				{
					Key: "song.mp3",
					PresetId: "1351620000001-300040" // MP3 - 128k
				},
			],
			Playlists: [
				{
					Name: 'playlist', // the extension m3u8 is automatically added for us
					Format: 'HLSv3',
					OutputKeys: [
						'segment.ts', // create a playlist for the segment.ts output
					],
				},
			],
		}, (err) => {
			if (err) {
				console.error(err);
			}
		}).promise();

		return { statusCode: 200, body: JSON.stringify({ message: 'success' }) };
	},

	save: async (req) => {
		let updatedSong = JSON.parse(req.body);

		const curComp = await competitionDb.getCurrent();

		if (updatedSong.id) {
			const existingSong = curComp.songs.find(s => s.id === updatedSong.id);

			// Check to make sure that the userId is not allowed to change unless you're changing it to/from you/partner or you're an admin
			if (!req.user.admin && existingSong.userId !== req.user.userId && existingSong.userId !== req.user.partnerId) {
				return { statusCode: 403, body: JSON.stringify({ message: 'You are not allowed to change the userId of the song to this userId' }) };
			}
			// Make sure the userId doesn't change
			updatedSong.userId = existingSong.userId;

			if (!existingSong) {
				return { statusCode: 404, body: JSON.stringify({ message: 'Song not found' }) };
			}

			updatedSong = { ...existingSong, ...updatedSong };
		}

		await competitionDb.saveSong(curComp, updatedSong);

		return { statusCode: 200, body: JSON.stringify({ song: updatedSong }) };
	},

	delete: async (req) => {
		const songId = req.routeParams['id'];

		const curComp = await competitionDb.getCurrent();
		const existingSong = curComp.songs?.some(s => s.id === songId);
		if (!existingSong) {
			return { statusCode: 404, body: JSON.stringify({ message: 'Song not found' }) };
		}

		// TODO: Delete the S3 objects
		// if (existingSong.filename) {
		// 	// Delete the song from AWS as well
		// 	const s3 = new AWS.S3({ apiVersion: '2006-03-01', region: 'us-west-2' });
		// 	await s3.deleteObject({
		// 		Bucket: 'wilson-notes',
		// 		Key: `uploads/${existingSong.filename}.${existingSong.extension}`,
		// 	}).promise();

		// 	// You can't just delete a folder, you have to list all objects and then you can
		// 	// call the deleteObjects() method to delete them all
		// }

		await competitionDb.deleteSong(curComp.name, songId);

		return { statusCode: 200, body: JSON.stringify({ message: 'success' }) };
	},

	all: async (req) => {
		const allSongs = await allSongsDb.get();

		return { statusCode: 200, body: JSON.stringify(allSongs.songs) };
	},
}

module.exports = songController;
