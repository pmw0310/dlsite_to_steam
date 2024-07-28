import axios from 'axios';

export async function GET(
   request: Request,
   { params }: { params: { workno: string } }
) {
   const { data } = await axios.get<Array<any>>(
      `https://www.dlsite.com/maniax/api/=/product.json?workno=${params.workno}`
   );

   if (data.length === 0) {
      return new Response(null, {
         status: 204,
      });
   }

   return Response.json({ image: data[0].image_main.url });
}
