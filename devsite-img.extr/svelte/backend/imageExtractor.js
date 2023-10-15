import axios from 'axios';
import { load } from 'cheerio';

const extractImages = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = load(response.data);
        const images = [];

        $('img').each((index, element) => {
            images.push($(element).attr('src'));
        });

        return images;
    } catch (error) {
        throw new Error('Failed to extract images from the provided URL.');
    }
};

export default extractImages;
