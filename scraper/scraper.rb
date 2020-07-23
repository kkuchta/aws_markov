# Doing this in RB because I'm lazy and don't feel like fighting with cheeriojs
# right now.  TODO: rewrite this in JS for consistency.

require "pry-byebug"
require "faraday"
require "nokogiri"
require "date"
require "json"
require "base64"

# First year was 2004
MIN_YEAR = 2004
MAX_YEAR = Time.now.year
conn = Faraday.new

# Options (can include multiple)
# :dump -> dumps all raw html to a json dump file
# :parse -> parses the dump file into a nicely-formatted json file (discarding a few weird posts)
# :export_bodies -> exports the parsed json file into a plain-text, paragraph-separated file for training (post bodies only)
# :export_titles -> exports the parsed json file into a plain-text, newline-separated file for training (post titles only)
operations = %i[export]

RAW_FILE = "./raw_blog.json"
JSON_FILE = "./blog_data.json"
TITLE_EXPORT_FILE = "./titles.txt"
BODY_EXPORT_FILE = "./bodies.txt"
BOTH_EXPORT_FILE = "./both.txt"

# Limit to only these links (for testing
only = [
  # '//aws.amazon.com/about-aws/whats-new/2015/01/07/developer-preview---resource-apis-for-version-3-of-aws-sdk-for-php/'
]

if operations.include?(:dump)
  all_blog_links = []
  if only.any?
    all_blog_links = only
  else
    MAX_YEAR.downto(MIN_YEAR).each do |year|
      # next
      url = "aws.amazon.com/about-aws/whats-new/#{year}/"
      response = conn.get("https://" + url)
      # Parsing html with a regex, because I like to live dangerously.
      blog_links = response.body.scan(%r{(//#{url}[^"]+)})
        .map(&:first)
      puts "Got #{blog_links.count} in #{year}"
      all_blog_links += blog_links
    end
  end
  all_blog_links.uniq!
  puts "Got #{all_blog_links.count} links"

  all_blog_raw = all_blog_links.map { |link|
    puts "Fetching #{link}"
    response = nil
    last_error = nil
    3.times do
      response = conn.get("https:" + link)
      break if response&.success?
    rescue Exception => e
      last_error = e
      puts e.message
    end

    raise last_error unless response&.success?

    {
      body: Base64.encode64(response.body),
      link: link
    }
  }

  puts "Saving all downloaded html to file"
  json = all_blog_raw.to_json
  File.write(RAW_FILE, json)
end

if operations.include?(:parse)
  puts "Parsing saved html"
  all_blog_data = []
  discards = []

  all_blog_raw = JSON.parse(File.read(RAW_FILE))
  # todo: read dump here
  if only.any?
    all_blog_raw = all_blog_raw.select { |raw| only.include? raw["link"] }
  end

  all_blog_raw.each do |raw|
    link = raw["link"]
    body = Base64.decode64(raw["body"])
    doc = Nokogiri::HTML(body)
    post_element = doc.css("main section").first

    # Strip empty text pieces
    post_pieces = post_element.children
      .reject { |child| child.is_a?(Nokogiri::XML::Text) && child.text.strip == "" }
    post_pieces

    title = post_pieces.first.text.strip
    if title.empty?
      # binding.pry
      # puts 'empty'
      discards << {link: link, reason: "empty title"}
      next
    end

    date_string = post_pieces[1].css(".date").text.strip
    puts date_string
    date = Date.parse(date_string)

    unless !date_string.empty? && date.year >= MIN_YEAR && date.year <= MAX_YEAR
      # binding.pry
      # raise "bad date #{date_string}"
      discards << {link: link, reason: "bas date"}
      next
    end

    paragraph_elements = post_pieces[2..-1]
      .flat_map { |piece| piece.css("p") }

    paragraphs = paragraph_elements.each do |element|
      # Remove any <style> elements
      element.css("style").remove
    end

    paragraphs = paragraphs
      .map(&:text).map(&:strip)
      .map { |paragraph| paragraph.tr(" ", " ") } # remove nonbreaking space
      .map { |paragraph| paragraph.delete("\n") }
      .map { |paragraph| paragraph.gsub(/\s{2,}/, "") }
      .reject(&:empty?)

    unless paragraphs.count > 0
      # binding.pry
      # raise "no paragraphs?"
      discards << {link: link, reason: "no paragraphs"}
      next
    end

    if paragraphs.any? { |par| par.match(%r{^\s*(//|#)}) }
      # TODO: Figure out how to exclude just code samples.  For now, just skip
      # anything with a code comment in it.
      discards << {link: link, reason: "looks like it contains code"}
      next
    end

    all_blog_data << {
      link: link,
      date: date.iso8601,
      title: title,
      paragraphs: paragraphs
    }
  end

  File.write(JSON_FILE, all_blog_data.to_json)

  puts "discards:"
  puts discards
end

if operations.include?(:export)
  all_blog_data = JSON.parse(File.read(JSON_FILE))

  # titles = all_blog_data.map{ _1["title"] }
  # bodies = all_blog_data.map{ _1["paragraphs"].join("\n") }
  both = all_blog_data.map { |post|
    [
      post["title"],
      post["paragraphs"]
    ].flatten.join("\n")
  }

  File.write(BOTH_EXPORT_FILE, both.join("\n\n"))
  # File.write(TITLE_EXPORT_FILE, titles.join("\n"))
  # File.write(BODY_EXPORT_FILE, bodies.join("\n\n"))

end

puts "Done"
