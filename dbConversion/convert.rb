def convert(id)
    comp = Competition.find(id)
    if comp.submitting?
        phase = "submitting"
    elsif comp.guessing?
        phase = "guessing"
    else
        phase = "closed"
    end
    songs = comp.songs.map {|song|
        id = song.created_at.utc.strftime("%s%L").to_i.to_s(36)
        <<TEXT.chomp
        "#{id}": {
            "artist": "#{song.artist}",
            "title": "#{song.name}",
            "filename": "#{song.file_name}",
            "extension": "#{song.extension}",
            "userId": #{song.user.id}
        }
TEXT
    }.join(",\n")
    attempts = comp.attempts.order(:created_at).map {|attempt|
        guesses = attempt.guesses.map {|guess|
            <<TEXT.chomp
                {
                    "songFilename": "#{guess.song.file_name}",
                    "guessedUserId": #{guess.user.id}
                }
TEXT
        }.join(",\n")
        <<TEXT.chomp
        {
            "createdAt": "#{attempt.created_at.as_json}",
            "correctCount": #{attempt.correct_count},
            "userId": #{attempt.user_id},
            "guesses": [
#{guesses}
            ]
        }
TEXT
    }.join(",\n")
    json = <<TEXT
{
    "pk": "Competition",
    "sk": "#{comp.name}",
    "phase": "#{phase}",
    "songs": {
#{songs}
    },
    "attempts": [
#{attempts}
    ]
}
TEXT
    puts json.squish
    nil
end

# Make sure that there are no extra "\n" in there
# FYI, competitions are about 24kb this way