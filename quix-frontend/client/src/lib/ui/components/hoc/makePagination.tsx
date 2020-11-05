import React, { useEffect, useState } from 'react';
import { Subtract } from 'utility-types';

interface InjectedPaginationProps {
  data: any[];
  columns: any[];
  onRowClicked(rows: any): void;
  getChunk(): void;
  isChunking: boolean;
}

interface MakePaginationProps {
  data: any[];
  columns: any[];
  onRowClicked(rows: any): void;
  loadMore(offset: number, limit: number): void;
  paginationSize: number;
  tableSize?(size: number): void;
}

const makePagination = <P extends InjectedPaginationProps>(
    Component: React.ComponentType<P>,
  ) =>  {
    const MakePagination: React.FC<
    Subtract<P, InjectedPaginationProps> & MakePaginationProps>
    = (props: MakePaginationProps) => {

      const [isChunking, setIsChunking ] = useState(false);
      const [requestCount, setRequestCount] = useState(0);
      const { data, columns, onRowClicked, loadMore, paginationSize, tableSize } = props;


      // TODO: fix it
      const size: number = 
      Math.floor(data.length % paginationSize) * (data.length > paginationSize ? paginationSize : 1) +
      Math.floor(requestCount / paginationSize) * paginationSize;

      useEffect(() => {
        setRequestCount(requestCount + 1);
        setIsChunking(false);
        if (tableSize) { tableSize(size) }
      }, [data]);


      const getChunk = () => {
        const resultsLeft = data.length % paginationSize === requestCount % paginationSize;
        if (!isChunking && resultsLeft) {
          setIsChunking(true);
          loadMore(paginationSize * requestCount, paginationSize);
        }
      }

      const componentProps = {
        columns,
        data: data.slice(0, size),
        isChunking,
        onRowClicked,
        getChunk,
      };
      return <Component {...componentProps as P} />
    }
    return MakePagination;
    }

export default makePagination;