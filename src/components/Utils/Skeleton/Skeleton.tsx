import { Box, BoxProps } from '@mantine/core';
import classes from './Skeleton.module.css';

export type SkeletonSize = 'sm' | 'md' | 'lg';

interface BaseSkeletonProps extends BoxProps {
  'data-testid'?: string;
}

interface TextSkeletonProps extends BaseSkeletonProps {
  /** Text line width */
  width?: 'short' | 'medium' | 'full';
  /** Text height size */
  size?: SkeletonSize;
}

interface AvatarSkeletonProps extends BaseSkeletonProps {
  /** Avatar size */
  size?: SkeletonSize;
}

interface IconSkeletonProps extends BaseSkeletonProps {
  /** Icon size */
  size?: SkeletonSize;
}

interface ButtonSkeletonProps extends BaseSkeletonProps {
  /** Button size */
  size?: SkeletonSize;
}

interface ChartSkeletonProps extends BaseSkeletonProps {
  /** Chart height size */
  size?: SkeletonSize;
}

interface TransactionListSkeletonProps extends BaseSkeletonProps {
  /** Number of transaction rows to show */
  count?: number;
}

interface StatCardSkeletonProps extends BaseSkeletonProps {
  /** Number of stat cards to show */
  count?: number;
}

interface CategoryListSkeletonProps extends BaseSkeletonProps {
  /** Number of category rows to show */
  count?: number;
}

interface TableSkeletonProps extends BaseSkeletonProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
}

/**
 * Text line skeleton placeholder
 */
export function TextSkeleton({
  width = 'full',
  size = 'md',
  'data-testid': testId,
  ...props
}: TextSkeletonProps) {
  const widthClass = {
    short: classes.textShort,
    medium: classes.textMedium,
    full: classes.textFull,
  }[width];

  const sizeClass = {
    sm: classes.textSm,
    md: '',
    lg: classes.textLg,
  }[size];

  return (
    <Box
      className={`${classes.skeleton} ${classes.text} ${widthClass} ${sizeClass}`}
      data-testid={testId}
      {...props}
    />
  );
}

/**
 * Title skeleton placeholder
 */
export function TitleSkeleton({ 'data-testid': testId, ...props }: BaseSkeletonProps) {
  return <Box className={`${classes.skeleton} ${classes.title}`} data-testid={testId} {...props} />;
}

/**
 * Avatar skeleton placeholder
 */
export function AvatarSkeleton({
  size = 'md',
  'data-testid': testId,
  ...props
}: AvatarSkeletonProps) {
  const sizeClass = {
    sm: classes.avatarSm,
    md: classes.avatarMd,
    lg: classes.avatarLg,
  }[size];

  return (
    <Box
      className={`${classes.skeleton} ${classes.avatar} ${sizeClass}`}
      data-testid={testId}
      {...props}
    />
  );
}

/**
 * Icon skeleton placeholder
 */
export function IconSkeleton({ size = 'md', 'data-testid': testId, ...props }: IconSkeletonProps) {
  const sizeClass = {
    sm: classes.iconSm,
    md: classes.iconMd,
    lg: classes.iconLg,
  }[size];

  return (
    <Box
      className={`${classes.skeleton} ${classes.icon} ${sizeClass}`}
      data-testid={testId}
      {...props}
    />
  );
}

/**
 * Button skeleton placeholder
 */
export function ButtonSkeleton({
  size = 'md',
  'data-testid': testId,
  ...props
}: ButtonSkeletonProps) {
  const sizeClass = {
    sm: classes.buttonSm,
    md: '',
    lg: classes.buttonLg,
  }[size];

  return (
    <Box
      className={`${classes.skeleton} ${classes.button} ${sizeClass}`}
      data-testid={testId}
      {...props}
    />
  );
}

/**
 * Chart skeleton placeholder
 */
export function ChartSkeleton({
  size = 'md',
  'data-testid': testId,
  ...props
}: ChartSkeletonProps) {
  const sizeClass = {
    sm: classes.chartSm,
    md: '',
    lg: classes.chartLg,
  }[size];

  return (
    <Box
      className={`${classes.skeleton} ${classes.chart} ${sizeClass}`}
      data-testid={testId}
      {...props}
    />
  );
}

/**
 * Card skeleton with title, text lines, and button
 */
export function CardSkeleton({ 'data-testid': testId, ...props }: BaseSkeletonProps) {
  return (
    <Box className={classes.card} data-testid={testId} {...props}>
      <TitleSkeleton />
      <TextSkeleton width="full" />
      <TextSkeleton width="full" />
      <TextSkeleton width="short" />
      <ButtonSkeleton mt="md" />
    </Box>
  );
}

/**
 * Transaction list item skeleton
 */
function TransactionItemSkeleton() {
  return (
    <div className={classes.transactionItem}>
      <div className={`${classes.skeleton} ${classes.transactionIcon}`} />
      <div className={classes.transactionContent}>
        <div className={`${classes.skeleton} ${classes.transactionTitle}`} />
        <div className={`${classes.skeleton} ${classes.transactionSubtitle}`} />
      </div>
      <div className={`${classes.skeleton} ${classes.transactionAmount}`} />
    </div>
  );
}

/**
 * Transaction list skeleton with multiple rows
 */
export function TransactionListSkeleton({
  count = 5,
  'data-testid': testId,
  ...props
}: TransactionListSkeletonProps) {
  return (
    <Box className={classes.transactionList} data-testid={testId} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <TransactionItemSkeleton key={index} />
      ))}
    </Box>
  );
}

/**
 * Single stat card skeleton
 */
function StatCardSkeletonItem() {
  return (
    <div className={classes.statCard}>
      <div className={`${classes.skeleton} ${classes.statLabel}`} />
      <div className={`${classes.skeleton} ${classes.statValue}`} />
      <div className={`${classes.skeleton} ${classes.statMeta}`} />
    </div>
  );
}

/**
 * Stats grid skeleton with multiple cards
 */
export function StatCardSkeleton({
  count = 4,
  'data-testid': testId,
  ...props
}: StatCardSkeletonProps) {
  return (
    <Box className={classes.statsGrid} data-testid={testId} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <StatCardSkeletonItem key={index} />
      ))}
    </Box>
  );
}

/**
 * Category bar skeleton item
 */
function CategoryBarSkeletonItem() {
  return (
    <div className={classes.categoryBar}>
      <div className={`${classes.skeleton} ${classes.categoryIcon}`} />
      <div className={classes.categoryContent}>
        <div className={`${classes.skeleton} ${classes.categoryName}`} />
        <div className={`${classes.skeleton} ${classes.categoryProgress}`} />
      </div>
      <div className={`${classes.skeleton} ${classes.categoryAmount}`} />
    </div>
  );
}

/**
 * Category list skeleton with multiple bars
 */
export function CategoryListSkeleton({
  count = 5,
  'data-testid': testId,
  ...props
}: CategoryListSkeletonProps) {
  return (
    <Box data-testid={testId} {...props}>
      {Array.from({ length: count }).map((_, index) => (
        <CategoryBarSkeletonItem key={index} />
      ))}
    </Box>
  );
}

/**
 * Table skeleton with rows and columns
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  'data-testid': testId,
  ...props
}: TableSkeletonProps) {
  return (
    <Box data-testid={testId} {...props}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={classes.tableRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`${classes.skeleton} ${classes.text} ${classes.tableCell}`}
            />
          ))}
        </div>
      ))}
    </Box>
  );
}

/**
 * Profile skeleton with avatar and info
 */
export function ProfileSkeleton({ 'data-testid': testId, ...props }: BaseSkeletonProps) {
  return (
    <Box className={classes.profile} data-testid={testId} {...props}>
      <AvatarSkeleton />
      <div className={classes.profileInfo}>
        <div className={`${classes.skeleton} ${classes.profileName}`} />
        <div className={`${classes.skeleton} ${classes.profileEmail}`} />
      </div>
    </Box>
  );
}
