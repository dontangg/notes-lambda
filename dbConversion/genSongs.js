const fs = require('fs');

const songs = [];

for (let i = 1; i < 11; i++) {
	const comp = require(`./c${i}.json`);

	Object.keys(comp.songs).forEach(id => {
		songs.push({
			compName: comp.sk,
			artist: comp.songs[id].artist,
			title: comp.songs[id].title,
			filename: comp.songs[id].filename,
			userId: comp.songs[id].userId,
		});
	});
}

const jsonToWrite = {
	pk: 'AllSongs',
	sk: 'index',
	songs,
};

fs.writeFileSync('songs.json', JSON.stringify(jsonToWrite, null, '\t'));
