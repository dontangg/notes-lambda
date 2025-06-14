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

		// Create MediaConvert client with the discovered endpoint
		const mediaConvert = new AWS.MediaConvert({
			region: 'us-west-2',
			endpoint: 'https://mlboolfjb.mediaconvert.us-west-2.amazonaws.com',
		});

		// Define the job parameters
		const params = {
			Role: 'arn:aws:iam::177961644364:role/MediaConvertRole',
			Settings: {
				Inputs: [
					{
						FileInput: `s3://wilson-notes/uploads/${fileInfo.filename}.${fileInfo.extension}`,
						AudioSelectors: {
							'Audio Selector 1': {
								DefaultSelection: 'DEFAULT'
							}
						}
					}
				],
				OutputGroups: [
					{
						// HLS Output Group
						Name: 'HLS',
						OutputGroupSettings: {
							Type: 'HLS_GROUP_SETTINGS',
							HlsGroupSettings: {
								SegmentLength: 30,
								MinSegmentLength: 0,
								Destination: `s3://wilson-notes/t/${fileInfo.filename}/playlist`,
								DirectoryStructure: 'SINGLE_DIRECTORY',
								SegmentControl: "SEGMENTED_FILES"
							}
						},
						Outputs: [
							{
								ContainerSettings: {
									Container: 'M3U8',
									M3u8Settings: {}
								},
								AudioDescriptions: [
									{
										CodecSettings: {
											Codec: 'AAC',
											AacSettings: {
												Bitrate: 96000,
												CodingMode: "CODING_MODE_2_0",
												SampleRate: 48000
											}
										},
										AudioSourceName: "Audio Selector 1"
									}
								],
								NameModifier: ".ts"
							}
						]
					},
					{
						// MP3 Output Group
						Name: 'MP3',
						OutputGroupSettings: {
							Type: 'FILE_GROUP_SETTINGS',
							FileGroupSettings: {
								Destination: `s3://wilson-notes/t/${fileInfo.filename}/song` // .mp3 extension is added automatically
							}
						},
						Outputs: [
							{
								ContainerSettings: {
									Container: 'RAW'
								},
								AudioDescriptions: [
									{
										CodecSettings: {
											Codec: 'MP3',
											Mp3Settings: {
												Bitrate: 192000,
												Channels: 2,
												RateControlMode: 'CBR',
												SampleRate: 48000
											}
										}
									}
								]
							}
						]
					}
				],
				FollowSource: 1
			},
		};

		try {
			const result = await mediaConvert.createJob(params).promise();
			console.log(`Job created: ${result.Job.Id}`);
			return { statusCode: 200, body: JSON.stringify({ message: 'success' }) };
		} catch (err) {
			console.error('Error creating MediaConvert job:', err);
			return { statusCode: 500, body: JSON.stringify({ message: 'Failed to create transcoding job' }) };
		}
	},

	save: async (req) => {
		let updatedSong = JSON.parse(req.body);

		const curComp = await competitionDb.getCurrent();

		if (updatedSong.id) {
			const existingSong = curComp.songs.find(s => s.id === updatedSong.id);

			// Check to make sure that the userId/reason is not allowed to change unless you're changing it to/from you/partner
			if (existingSong.userId !== req.user.userId && existingSong.userId !== req.user.partnerId) {
				updatedSong.reason = existingSong.reason;
				updatedSong.userId = existingSong.userId;
			}

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
