'use client';

import axios from 'axios';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import styled from '@emotion/styled';
import getCroppedImg from './cropImage';
import Image from 'next/image';
import { useDebounce } from 'use-debounce';
import Button from '@mui/material/Button';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';

const RootCropper = styled.div`
   position: relative;
   width: 100%;
   height: 400px;
   margin-top: 12px;
`;

const SteamGrid = styled.div`
   width: 267px;
   max-width: 267px;
   height: 400px;
   max-height: 400px;
   display: grid;

   .grid_image {
      position: absolute;
      & > img {
         position: relative;
         bottom: 0;
      }
   }
`;

interface DlsiteData {
   image: string;
}

export default function Home() {
   const [productId, setProductId] = useState<string>('RJ01212507');
   const [productIdValue] = useDebounce(productId, 500);
   const [image, setImage] = useState<string | null>(null);
   const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [croppedImage, setCroppedImage] = useState<string | null>(null);
   const [croppedImageValue] = useDebounce(croppedImage, 150);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   const resetState = () => {
      setImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedImage(null);
   };

   useEffect(() => {
      if (!productIdValue) {
         resetState();
         return;
      }

      (async () => {
         try {
            const { data, status } = await axios.get<DlsiteData | null>(
               `/api/dlsite/${productIdValue}`
            );

            if (status === 200 && data?.image) {
               setImage(data?.image);
            } else {
               resetState();
            }
         } catch {
            resetState();
         }
      })();
   }, [productIdValue]);

   const onCropComplete = async (
      _croppedArea: Area,
      croppedAreaPixels: Area
   ) => {
      if (!image) {
         return;
      }

      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      setCroppedImage(croppedImage);
   };

   const saveAsImageHandler = () => {
      const target = document.getElementById('steam_grid');
      if (!target) {
         return alert('저장에 실패했습니다.');
      }
      html2canvas(target).then((canvas) => {
         const link = document.createElement('a');
         document.body.appendChild(link);
         link.href = canvas.toDataURL('image/jpeg');
         link.download = `${productIdValue}.jpg`;
         link.click();
         document.body.removeChild(link);
      });
   };

   useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas!.getContext('2d')!;
      const grd = ctx.createLinearGradient(0, 0, 0, 54);
      grd.addColorStop(0, '#00467F');
      grd.addColorStop(1, '#002859');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 267, 54);
      ctx.beginPath();
      ctx.strokeStyle = '#2EB9FB';
      ctx.lineWidth = 6;
      ctx.moveTo(0, 51);
      ctx.lineTo(267, 51);
      ctx.stroke();
   }, [croppedImageValue]);

   https: return (
      <Container>
         <TextField
            id="product-id"
            label="Product ID"
            variant="outlined"
            value={productId}
            onChange={({ target: { value } }) => {
               setProductId(value.trim());
            }}
            fullWidth
         />
         {image && (
            <>
               <RootCropper>
                  <Cropper
                     image={image}
                     crop={crop}
                     zoom={zoom}
                     aspect={267 / (400 - 54)}
                     onCropChange={setCrop}
                     onCropComplete={onCropComplete}
                     onZoomChange={setZoom}
                  />
               </RootCropper>
            </>
         )}
         {!image && <RootCropper />}
         <SteamGrid id="steam_grid">
            <canvas
               className="grid_cover"
               ref={canvasRef}
               width={267}
               height={54}
            />
            <Image
               src={croppedImageValue ?? ''}
               alt="SteamGrid"
               width={267}
               height={400 - 54}
               quality={100}
               unoptimized
            />
         </SteamGrid>
         <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={saveAsImageHandler}
            disabled={!croppedImageValue}
         >
            다운로드
         </Button>
      </Container>
   );
}
